-- ==============================================================
-- FIX 1: Secure OTP storage - Move to separate protected table
-- ==============================================================

-- Create new phone_verifications table with NO SELECT policy (only backend access)
CREATE TABLE IF NOT EXISTS public.phone_verifications (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  otp_code TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes')
);

-- Enable RLS but NO SELECT policy - only SECURITY DEFINER functions can access
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Create function to send OTP (stores in secure table)
CREATE OR REPLACE FUNCTION public.send_phone_otp(p_user_id UUID, p_otp_code TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert OTP into secure table
  INSERT INTO public.phone_verifications (user_id, otp_code, sent_at, expires_at)
  VALUES (p_user_id, p_otp_code, now(), now() + INTERVAL '10 minutes')
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    otp_code = p_otp_code,
    sent_at = now(),
    expires_at = now() + INTERVAL '10 minutes';
  
  RETURN TRUE;
END;
$$;

-- Create function to verify OTP (checks secure table, marks phone verified)
CREATE OR REPLACE FUNCTION public.verify_phone_otp(p_user_id UUID, p_otp_code TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stored_otp TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Get stored OTP
  SELECT otp_code, expires_at INTO v_stored_otp, v_expires_at
  FROM public.phone_verifications
  WHERE user_id = p_user_id;
  
  -- Check if OTP exists and matches
  IF v_stored_otp IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if expired
  IF v_expires_at < now() THEN
    -- Delete expired OTP
    DELETE FROM public.phone_verifications WHERE user_id = p_user_id;
    RETURN FALSE;
  END IF;
  
  -- Verify OTP
  IF v_stored_otp = p_otp_code THEN
    -- Mark phone as verified
    UPDATE public.profiles SET is_phone_verified = TRUE WHERE id = p_user_id;
    -- Delete used OTP
    DELETE FROM public.phone_verifications WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Remove OTP columns from profiles table (they're now in phone_verifications)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone_otp_code;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone_otp_sent_at;

-- ==============================================================
-- FIX 2: Server-side price calculation in book_ride_atomic
-- ==============================================================

-- Define platform fee percentage as a constant (5%)
CREATE OR REPLACE FUNCTION public.book_ride_atomic(
  p_ride_id UUID,
  p_passenger_id UUID,
  p_seats_requested INTEGER,
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
  v_calculated_price NUMERIC;
  v_platform_fee NUMERIC;
  v_platform_fee_percentage NUMERIC := 0.05; -- 5% platform fee
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

  -- SERVER-SIDE PRICE CALCULATION (no longer trusting client input)
  v_calculated_price := v_ride.price_per_seat * p_seats_requested;
  v_platform_fee := v_calculated_price * v_platform_fee_percentage;

  -- Create the booking with server-calculated prices
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
    v_calculated_price,
    v_platform_fee,
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