-- Enhancement migration: Server-side validation, race condition prevention, and security improvements
-- This migration addresses multiple requirements from the problem statement

-- 1. Extend booking_status enum to include more lifecycle states
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'expired';

-- 2. Add instant_approval column to rides table for filtering
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS instant_approval BOOLEAN DEFAULT true;

-- 3. Add price cap validation at database level
-- Update existing constraint to enforce MAX_PRICE_PER_KM (₹5/km)
ALTER TABLE public.rides DROP CONSTRAINT IF EXISTS rides_price_per_seat_check;
ALTER TABLE public.rides ADD CONSTRAINT rides_price_per_seat_check 
  CHECK (
    price_per_seat >= 0 AND 
    (distance_km IS NULL OR price_per_seat <= (distance_km * 5))
  );

-- 4. Create function to validate women-only ride restrictions
CREATE OR REPLACE FUNCTION validate_women_only_ride()
RETURNS TRIGGER AS $$
BEGIN
  -- Only women can create women-only rides
  IF NEW.is_women_only = true THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = NEW.driver_id AND gender = 'female'
    ) THEN
      RAISE EXCEPTION 'Only women can create women-only rides';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for women-only validation
DROP TRIGGER IF EXISTS validate_women_only_ride_trigger ON public.rides;
CREATE TRIGGER validate_women_only_ride_trigger
  BEFORE INSERT OR UPDATE ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION validate_women_only_ride();

-- 5. Create function to prevent double booking on same ride
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if passenger already has an active booking for this ride
  -- Only check on INSERT; on UPDATE the id will already exist
  IF TG_OP = 'INSERT' THEN
    IF EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE ride_id = NEW.ride_id 
        AND passenger_id = NEW.passenger_id 
        AND status IN ('pending', 'confirmed')
    ) THEN
      RAISE EXCEPTION 'You already have an active booking for this ride';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for double booking prevention
DROP TRIGGER IF EXISTS prevent_double_booking_trigger ON public.bookings;
CREATE TRIGGER prevent_double_booking_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION prevent_double_booking();

-- 6. Create function to handle seat availability with row-level locking
CREATE OR REPLACE FUNCTION book_ride_seats(
  p_ride_id UUID,
  p_passenger_id UUID,
  p_seats_requested INTEGER,
  p_total_price DECIMAL(10,2),
  p_platform_fee DECIMAL(10,2),
  p_pickup_point_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_current_seats INTEGER;
BEGIN
  -- Lock the ride row to prevent race conditions
  SELECT seats_available INTO v_current_seats
  FROM public.rides
  WHERE id = p_ride_id
  FOR UPDATE;
  
  -- Check if enough seats are available
  IF v_current_seats < p_seats_requested THEN
    RAISE EXCEPTION 'Not enough seats available. Only % seats left', v_current_seats;
  END IF;
  
  -- Validate pickup point belongs to ride if provided
  IF p_pickup_point_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.pickup_points 
      WHERE id = p_pickup_point_id AND ride_id = p_ride_id
    ) THEN
      RAISE EXCEPTION 'Invalid pickup point for this ride';
    END IF;
  END IF;
  
  -- Create the booking
  INSERT INTO public.bookings (
    ride_id, passenger_id, seats_booked, total_price, platform_fee, 
    status, payment_status, pickup_point_id
  ) VALUES (
    p_ride_id, p_passenger_id, p_seats_requested, p_total_price, 
    p_platform_fee, 'pending', 'pending', p_pickup_point_id
  ) RETURNING id INTO v_booking_id;
  
  -- Update seat availability
  UPDATE public.rides
  SET seats_available = seats_available - p_seats_requested
  WHERE id = p_ride_id;
  
  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Create function to cancel booking and restore seats
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_ride_id UUID;
  v_seats_booked INTEGER;
  v_current_status TEXT;
BEGIN
  -- Lock and get booking details
  SELECT ride_id, seats_booked, status INTO v_ride_id, v_seats_booked, v_current_status
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;
  
  -- Only cancel if not already cancelled
  IF v_current_status = 'cancelled' THEN
    RAISE EXCEPTION 'Booking is already cancelled';
  END IF;
  
  -- Update booking status
  UPDATE public.bookings
  SET status = 'cancelled'
  WHERE id = p_booking_id;
  
  -- Restore seats to the ride
  UPDATE public.rides
  SET seats_available = seats_available + v_seats_booked
  WHERE id = v_ride_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Create function to automatically expire old pending bookings
CREATE OR REPLACE FUNCTION expire_old_bookings()
RETURNS void AS $$
BEGIN
  -- Expire bookings that are pending for more than 24 hours before ride departure
  UPDATE public.bookings b
  SET status = 'expired'
  FROM public.rides r
  WHERE b.ride_id = r.id
    AND b.status = 'pending'
    AND r.departure_time > NOW()
    AND b.created_at < (r.departure_time - INTERVAL '24 hours');
    
  -- Restore seats for expired bookings
  UPDATE public.rides r
  SET seats_available = seats_available + (
    SELECT COALESCE(SUM(b.seats_booked), 0)
    FROM public.bookings b
    WHERE b.ride_id = r.id
      AND b.status = 'expired'
      AND b.updated_at >= NOW() - INTERVAL '1 minute'
  )
  WHERE id IN (
    SELECT DISTINCT ride_id 
    FROM public.bookings 
    WHERE status = 'expired' 
      AND updated_at >= NOW() - INTERVAL '1 minute'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Create function to complete rides automatically after departure
CREATE OR REPLACE FUNCTION complete_past_rides()
RETURNS void AS $$
BEGIN
  -- Mark rides as completed that have passed their departure time
  UPDATE public.rides
  SET status = 'completed'
  WHERE status = 'active'
    AND departure_time < NOW() - INTERVAL '6 hours';
    
  -- Mark confirmed bookings as completed
  UPDATE public.bookings b
  SET status = 'completed'
  FROM public.rides r
  WHERE b.ride_id = r.id
    AND b.status = 'confirmed'
    AND r.status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Enhance messages table with read receipts and read_at timestamp
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Create index on messages for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON public.messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- 11. Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
  p_booking_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE public.messages
  SET is_read = true,
      read_at = NOW()
  WHERE booking_id = p_booking_id
    AND sender_id != p_user_id
    AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 12. Enhanced RLS policies for messages with pagination support
-- Update messages policy to enforce booking participant validation
DROP POLICY IF EXISTS "Booking participants can view messages" ON public.messages;
CREATE POLICY "Booking participants can view messages"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.rides r ON b.ride_id = r.id
    WHERE b.id = messages.booking_id
      AND (b.passenger_id = auth.uid() OR r.driver_id = auth.uid())
  )
);

-- 13. Add indexes for better search and query performance
CREATE INDEX IF NOT EXISTS idx_rides_origin ON public.rides(origin);
CREATE INDEX IF NOT EXISTS idx_rides_destination ON public.rides(destination);
CREATE INDEX IF NOT EXISTS idx_rides_departure_time ON public.rides(departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_price ON public.rides(price_per_seat);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_id ON public.bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ride_id ON public.bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- 14. Create earnings view for drivers
CREATE OR REPLACE VIEW driver_earnings AS
SELECT 
  r.driver_id,
  COUNT(DISTINCT b.id) as total_bookings,
  SUM(b.seats_booked) as total_seats_sold,
  SUM(b.total_price - b.platform_fee) as total_earnings,
  SUM(b.platform_fee) as total_platform_fees,
  COUNT(DISTINCT r.id) as total_rides,
  COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) as confirmed_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.id END) as cancelled_bookings
FROM public.rides r
LEFT JOIN public.bookings b ON r.id = b.ride_id
WHERE r.status IN ('active', 'completed')
GROUP BY r.driver_id;

-- Grant select permission on the view
GRANT SELECT ON driver_earnings TO authenticated;

-- 15. Create RLS policy for driver earnings view
ALTER VIEW driver_earnings SET (security_invoker = true);

-- 16. Add trigger to prevent booking own ride
CREATE OR REPLACE FUNCTION prevent_self_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.rides 
    WHERE id = NEW.ride_id AND driver_id = NEW.passenger_id
  ) THEN
    RAISE EXCEPTION 'You cannot book your own ride';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS prevent_self_booking_trigger ON public.bookings;
CREATE TRIGGER prevent_self_booking_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_booking();

-- 17. Add typing indicator support (temporary table for realtime updates)
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  last_typed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (booking_id, user_id)
);

-- Enable RLS on typing_indicators
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Typing indicators policies
CREATE POLICY "Booking participants can view typing indicators"
ON public.typing_indicators FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.rides r ON b.ride_id = r.id
    WHERE b.id = typing_indicators.booking_id
      AND (b.passenger_id = auth.uid() OR r.driver_id = auth.uid())
  )
);

CREATE POLICY "Booking participants can update typing indicators"
ON public.typing_indicators FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.rides r ON b.ride_id = r.id
    WHERE b.id = typing_indicators.booking_id
      AND (b.passenger_id = auth.uid() OR r.driver_id = auth.uid())
      AND user_id = auth.uid()
  )
);

-- Enable realtime for typing indicators
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;

-- 18. Add cleanup function for old typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM public.typing_indicators
  WHERE last_typed_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
