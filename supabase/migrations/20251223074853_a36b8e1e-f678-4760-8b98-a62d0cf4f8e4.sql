-- =====================================================
-- 1. ATOMIC BOOKING FUNCTION (Race-condition safe)
-- =====================================================
CREATE OR REPLACE FUNCTION public.book_ride_atomic(
  p_ride_id UUID,
  p_passenger_id UUID,
  p_seats_requested INTEGER,
  p_total_price NUMERIC,
  p_platform_fee NUMERIC,
  p_pickup_point_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ride RECORD;
  v_booking_id UUID;
  v_existing_booking_count INTEGER;
BEGIN
  -- Lock the ride row for update to prevent race conditions
  SELECT * INTO v_ride
  FROM public.rides
  WHERE id = p_ride_id
  FOR UPDATE;

  -- Validate ride exists and is active
  IF v_ride IS NULL THEN
    RAISE EXCEPTION 'Ride not found';
  END IF;

  IF v_ride.status != 'active' THEN
    RAISE EXCEPTION 'This ride is no longer available';
  END IF;

  -- Check departure time is in the future
  IF v_ride.departure_time <= NOW() THEN
    RAISE EXCEPTION 'Cannot book a ride that has already departed';
  END IF;

  -- Prevent self-booking
  IF v_ride.driver_id = p_passenger_id THEN
    RAISE EXCEPTION 'You cannot book your own ride';
  END IF;

  -- Check seats availability
  IF v_ride.seats_available < p_seats_requested THEN
    RAISE EXCEPTION 'Only % seats available', v_ride.seats_available;
  END IF;

  -- Check for existing active booking by same passenger on same ride
  SELECT COUNT(*) INTO v_existing_booking_count
  FROM public.bookings
  WHERE ride_id = p_ride_id
    AND passenger_id = p_passenger_id
    AND status IN ('pending', 'confirmed');

  IF v_existing_booking_count > 0 THEN
    RAISE EXCEPTION 'You already have an active booking for this ride';
  END IF;

  -- Validate pickup point belongs to this ride (if provided)
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
    ride_id,
    passenger_id,
    seats_booked,
    total_price,
    platform_fee,
    pickup_point_id,
    status
  ) VALUES (
    p_ride_id,
    p_passenger_id,
    p_seats_requested,
    p_total_price,
    p_platform_fee,
    p_pickup_point_id,
    'pending'
  ) RETURNING id INTO v_booking_id;

  -- Decrement available seats
  UPDATE public.rides
  SET seats_available = seats_available - p_seats_requested
  WHERE id = p_ride_id;

  RETURN v_booking_id;
END;
$$;

-- =====================================================
-- 2. ATOMIC CANCELLATION FUNCTION (with seat release)
-- =====================================================
CREATE OR REPLACE FUNCTION public.cancel_booking_atomic(
  p_booking_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking RECORD;
  v_ride RECORD;
BEGIN
  -- Lock booking row for update
  SELECT b.*, r.driver_id, r.departure_time
  INTO v_booking
  FROM public.bookings b
  JOIN public.rides r ON r.id = b.ride_id
  WHERE b.id = p_booking_id
  FOR UPDATE OF b;

  IF v_booking IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Check authorization: only passenger or driver can cancel
  IF v_booking.passenger_id != p_user_id AND v_booking.driver_id != p_user_id THEN
    RAISE EXCEPTION 'You are not authorized to cancel this booking';
  END IF;

  -- Check if already cancelled
  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'This booking is already cancelled';
  END IF;

  -- Check if ride has departed (only allow cancellation before departure)
  IF v_booking.departure_time <= NOW() THEN
    RAISE EXCEPTION 'Cannot cancel a booking for a ride that has already departed';
  END IF;

  -- Cancel the booking
  UPDATE public.bookings
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_booking_id;

  -- Restore seats to the ride
  UPDATE public.rides
  SET seats_available = seats_available + v_booking.seats_booked
  WHERE id = v_booking.ride_id;

  RETURN TRUE;
END;
$$;

-- =====================================================
-- 3. RIDE VALIDATION TRIGGER (server-side enforcement)
-- =====================================================
CREATE OR REPLACE FUNCTION public.validate_ride_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_driver_gender TEXT;
  v_max_price_per_km NUMERIC := 7.5;
BEGIN
  -- Check departure time is in the future
  IF NEW.departure_time <= NOW() THEN
    RAISE EXCEPTION 'Departure time must be in the future';
  END IF;

  -- Check seats are within valid range (1-8)
  IF NEW.seats_available < 1 OR NEW.seats_available > 8 THEN
    RAISE EXCEPTION 'Seats must be between 1 and 8';
  END IF;

  -- Enforce price cap if distance is provided
  IF NEW.distance_km IS NOT NULL AND NEW.distance_km > 0 THEN
    IF NEW.price_per_seat > (NEW.distance_km * v_max_price_per_km) THEN
      RAISE EXCEPTION 'Price exceeds maximum allowed (₹% per km)', v_max_price_per_km;
    END IF;
  END IF;

  -- Enforce women-only restriction: driver must be female
  IF NEW.is_women_only = TRUE THEN
    SELECT gender INTO v_driver_gender
    FROM public.profiles
    WHERE id = NEW.driver_id;

    IF v_driver_gender IS NULL OR v_driver_gender != 'female' THEN
      RAISE EXCEPTION 'Only female drivers can create women-only rides';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger (drop first if exists)
DROP TRIGGER IF EXISTS validate_ride_before_insert ON public.rides;
CREATE TRIGGER validate_ride_before_insert
  BEFORE INSERT ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_ride_creation();

-- Also validate on update
DROP TRIGGER IF EXISTS validate_ride_before_update ON public.rides;
CREATE TRIGGER validate_ride_before_update
  BEFORE UPDATE ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_ride_creation();

-- =====================================================
-- 4. MESSAGE SECURITY FUNCTION (verify user in booking)
-- =====================================================
CREATE OR REPLACE FUNCTION public.can_access_booking_chat(
  p_booking_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings b
    JOIN public.rides r ON r.id = b.ride_id
    WHERE b.id = p_booking_id
      AND (b.passenger_id = p_user_id OR r.driver_id = p_user_id)
  );
$$;

-- =====================================================
-- 5. MESSAGE RATE LIMITING TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_count INTEGER;
  v_max_messages_per_minute INTEGER := 10;
BEGIN
  -- Verify user can access this booking's chat
  IF NOT public.can_access_booking_chat(NEW.booking_id, NEW.sender_id) THEN
    RAISE EXCEPTION 'You are not authorized to send messages in this booking';
  END IF;

  -- Check rate limit (10 messages per minute)
  SELECT COUNT(*) INTO v_message_count
  FROM public.messages
  WHERE sender_id = NEW.sender_id
    AND booking_id = NEW.booking_id
    AND created_at > NOW() - INTERVAL '1 minute';

  IF v_message_count >= v_max_messages_per_minute THEN
    RAISE EXCEPTION 'Message rate limit exceeded. Please wait before sending more messages.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_message_rate_limit_trigger ON public.messages;
CREATE TRIGGER check_message_rate_limit_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_message_rate_limit();

-- =====================================================
-- 6. RATING CONSTRAINT (1-5 range)
-- =====================================================
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_rating_check;
ALTER TABLE public.ratings ADD CONSTRAINT ratings_rating_check CHECK (rating >= 1 AND rating <= 5);

-- =====================================================
-- 7. UPDATE AVERAGE RATING TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avg_rating NUMERIC;
BEGIN
  -- Calculate new average rating for the rated user
  SELECT ROUND(AVG(rating)::NUMERIC, 2) INTO v_avg_rating
  FROM public.ratings
  WHERE rated_id = NEW.rated_id;

  -- Update the user's profile
  UPDATE public.profiles
  SET rating = v_avg_rating
  WHERE id = NEW.rated_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_rating_trigger ON public.ratings;
CREATE TRIGGER update_user_rating_trigger
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_rating();

-- =====================================================
-- 8. RLS POLICY: Drivers can view their own rides (any status)
-- =====================================================
DROP POLICY IF EXISTS "Drivers can view own rides" ON public.rides;
CREATE POLICY "Drivers can view own rides" 
  ON public.rides 
  FOR SELECT 
  USING (auth.uid() = driver_id);