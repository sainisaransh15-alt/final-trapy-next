-- Create function to validate women-only bookings
-- This function validates that only female passengers can book women-only rides
CREATE OR REPLACE FUNCTION public.validate_women_only_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_ride_is_women_only BOOLEAN;
  v_passenger_gender TEXT;
BEGIN
  -- Get ride's women-only status
  SELECT is_women_only INTO v_ride_is_women_only
  FROM public.rides
  WHERE id = NEW.ride_id;

  -- If ride is women-only, validate passenger gender
  IF v_ride_is_women_only = TRUE THEN
    SELECT gender INTO v_passenger_gender
    FROM public.profiles
    WHERE id = NEW.passenger_id;

    IF v_passenger_gender IS NULL THEN
      RAISE EXCEPTION 'Please complete your profile with gender information to book this ride.';
    END IF;

    IF v_passenger_gender != 'female' THEN
      RAISE EXCEPTION 'This ride is for women only. Only female passengers can book this ride.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
