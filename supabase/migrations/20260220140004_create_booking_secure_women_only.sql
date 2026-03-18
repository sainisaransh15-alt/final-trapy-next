-- Update create_booking_secure function with women-only validation
CREATE OR REPLACE FUNCTION public.create_booking_secure(
  p_ride_id UUID,
  p_seats INTEGER,
  p_price NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ride RECORD;
  v_booking_id UUID;
  v_platform_fee NUMERIC;
  v_platform_fee_percentage NUMERIC := 0.10;
  v_passenger_gender TEXT;
  v_passenger_id UUID;
BEGIN
  -- Get the authenticated user's ID
  v_passenger_id := auth.uid();
  
  IF v_passenger_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to book a ride';
  END IF;

  -- Get and lock the ride
  SELECT * INTO v_ride
  FROM public.rides
  WHERE id = p_ride_id
  FOR UPDATE;
  
  IF v_ride IS NULL THEN
    RAISE EXCEPTION 'Ride not found';
  END IF;
  
  IF v_ride.status != 'active' THEN
    RAISE EXCEPTION 'This ride is no longer available';
  END IF;
  
  IF v_ride.departure_time <= NOW() THEN
    RAISE EXCEPTION 'Cannot book a ride that has already departed';
  END IF;
  
  IF v_ride.driver_id = v_passenger_id THEN
    RAISE EXCEPTION 'You cannot book your own ride';
  END IF;
  
  IF v_ride.seats_available < p_seats THEN
    RAISE EXCEPTION 'Only % seats available', v_ride.seats_available;
  END IF;

  -- *** WOMEN-ONLY VALIDATION ***
  IF v_ride.is_women_only = TRUE THEN
    SELECT gender INTO v_passenger_gender
    FROM public.profiles
    WHERE id = v_passenger_id;

    IF v_passenger_gender IS NULL THEN
      RAISE EXCEPTION 'Please complete your profile with gender information to book this ride.';
    END IF;

    IF v_passenger_gender != 'female' THEN
      RAISE EXCEPTION 'This ride is for women only. Only female passengers can book this ride.';
    END IF;
  END IF;
  
  -- Check for existing booking
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE ride_id = p_ride_id
      AND passenger_id = v_passenger_id
      AND status IN ('pending', 'confirmed')
  ) THEN
    RAISE EXCEPTION 'You already have an active booking for this ride';
  END IF;
  
  -- Calculate platform fee server-side
  v_platform_fee := ROUND(p_price * v_platform_fee_percentage, 2);
  
  -- Create booking
  INSERT INTO public.bookings (
    ride_id,
    passenger_id,
    seats_booked,
    total_price,
    platform_fee,
    status
  ) VALUES (
    p_ride_id,
    v_passenger_id,
    p_seats,
    p_price,
    v_platform_fee,
    'pending'
  ) RETURNING id INTO v_booking_id;
  
  -- Update available seats
  UPDATE public.rides
  SET seats_available = seats_available - p_seats
  WHERE id = p_ride_id;
  
  RETURN v_booking_id;
END;
$$;
