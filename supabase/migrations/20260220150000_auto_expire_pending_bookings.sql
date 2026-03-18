-- Auto-expire pending bookings after a certain period
-- This helps prevent seats from being held indefinitely

-- 1. Create function to expire pending bookings
CREATE OR REPLACE FUNCTION public.expire_pending_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_count INTEGER := 0;
  v_booking RECORD;
  v_expiry_hours INTEGER := 24; -- Bookings expire after 24 hours of pending status
BEGIN
  -- Find all pending bookings older than expiry period where ride hasn't departed yet
  FOR v_booking IN
    SELECT b.id, b.ride_id, b.seats_booked, b.passenger_id, r.origin, r.destination
    FROM public.bookings b
    JOIN public.rides r ON r.id = b.ride_id
    WHERE b.status = 'pending'
      AND b.created_at < NOW() - INTERVAL '1 hour' * v_expiry_hours
      AND r.departure_time > NOW() -- Only for future rides
  LOOP
    -- Update booking status to expired
    UPDATE public.bookings
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = v_booking.id;
    
    -- Restore seats to the ride
    UPDATE public.rides
    SET seats_available = seats_available + v_booking.seats_booked
    WHERE id = v_booking.ride_id;
    
    -- Create notification for passenger
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      v_booking.passenger_id,
      'booking_expired',
      'Booking Expired',
      'Your booking request for ' || v_booking.origin || ' to ' || v_booking.destination || ' has expired as the driver did not respond within 24 hours.',
      jsonb_build_object('booking_id', v_booking.id, 'ride_id', v_booking.ride_id)
    );
    
    v_expired_count := v_expired_count + 1;
  END LOOP;
  
  RETURN v_expired_count;
END;
$$;

-- 2. Also expire pending bookings for rides that have already departed
CREATE OR REPLACE FUNCTION public.expire_departed_ride_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_count INTEGER := 0;
  v_booking RECORD;
BEGIN
  -- Find all pending bookings for rides that have already departed
  FOR v_booking IN
    SELECT b.id, b.ride_id, b.seats_booked, b.passenger_id, r.origin, r.destination
    FROM public.bookings b
    JOIN public.rides r ON r.id = b.ride_id
    WHERE b.status = 'pending'
      AND r.departure_time <= NOW()
  LOOP
    -- Update booking status to cancelled
    UPDATE public.bookings
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = v_booking.id;
    
    -- Note: Don't restore seats as ride has departed
    
    -- Create notification for passenger
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      v_booking.passenger_id,
      'booking_missed',
      'Booking Missed',
      'Your pending booking for ' || v_booking.origin || ' to ' || v_booking.destination || ' was not confirmed before departure.',
      jsonb_build_object('booking_id', v_booking.id, 'ride_id', v_booking.ride_id)
    );
    
    v_expired_count := v_expired_count + 1;
  END LOOP;
  
  RETURN v_expired_count;
END;
$$;

-- 3. Combined cleanup function that can be called by cron or manually
CREATE OR REPLACE FUNCTION public.cleanup_expired_bookings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pending_expired INTEGER;
  v_departed_expired INTEGER;
BEGIN
  -- Expire old pending bookings
  SELECT public.expire_pending_bookings() INTO v_pending_expired;
  
  -- Expire bookings for departed rides
  SELECT public.expire_departed_ride_bookings() INTO v_departed_expired;
  
  RETURN jsonb_build_object(
    'pending_expired', v_pending_expired,
    'departed_expired', v_departed_expired,
    'total_expired', v_pending_expired + v_departed_expired,
    'executed_at', NOW()
  );
END;
$$;

-- 4. Grant execute permission for the cleanup function to be callable
GRANT EXECUTE ON FUNCTION public.cleanup_expired_bookings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_bookings() TO service_role;

-- 5. Add notification type for expired bookings (if using enum, otherwise skip)
-- Note: The notifications table uses TEXT type for 'type', so no ALTER needed

-- 6. Create index for faster cleanup queries
CREATE INDEX IF NOT EXISTS idx_bookings_pending_created 
  ON public.bookings(created_at) 
  WHERE status = 'pending';

-- 7. Enable pg_cron extension if available (this may fail on some Supabase plans)
-- The extension needs to be enabled via Supabase dashboard if not already
DO $$
BEGIN
  -- Try to create the cron job (will only work if pg_cron is available)
  -- Run cleanup every hour
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-expired-bookings',
      '0 * * * *', -- Every hour at minute 0
      'SELECT public.cleanup_expired_bookings()'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- pg_cron not available, that's okay - can be triggered via Edge Function
    RAISE NOTICE 'pg_cron not available. Use Edge Function or manual trigger for cleanup.';
END;
$$;
