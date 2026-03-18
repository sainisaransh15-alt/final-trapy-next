-- Update book_ride_atomic function with 10% platform fee
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
  v_server_platform_fee NUMERIC;
  v_platform_fee_percentage NUMERIC := 0.10;
BEGIN
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

  IF v_ride.driver_id = p_passenger_id THEN
    RAISE EXCEPTION 'You cannot book your own ride';
  END IF;

  IF v_ride.seats_available < p_seats_requested THEN
    RAISE EXCEPTION 'Only % seats available', v_ride.seats_available;
  END IF;

  SELECT COUNT(*) INTO v_existing_booking_count
  FROM public.bookings
  WHERE ride_id = p_ride_id
    AND passenger_id = p_passenger_id
    AND status IN ('pending', 'confirmed');

  IF v_existing_booking_count > 0 THEN
    RAISE EXCEPTION 'You already have an active booking for this ride';
  END IF;

  IF p_pickup_point_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.pickup_points
      WHERE id = p_pickup_point_id AND ride_id = p_ride_id
    ) THEN
      RAISE EXCEPTION 'Invalid pickup point for this ride';
    END IF;
  END IF;

  v_server_platform_fee := ROUND(p_total_price * v_platform_fee_percentage, 2);

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
    v_server_platform_fee,
    p_pickup_point_id,
    'pending'
  ) RETURNING id INTO v_booking_id;

  UPDATE public.rides
  SET seats_available = seats_available - p_seats_requested
  WHERE id = p_ride_id;

  RETURN v_booking_id;
END;
$$;
