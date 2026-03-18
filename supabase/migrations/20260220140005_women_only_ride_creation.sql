-- Update women-only ride creation validation to verify driver profile
CREATE OR REPLACE FUNCTION public.validate_women_only_ride()
RETURNS TRIGGER AS $$
DECLARE
  v_driver_gender TEXT;
BEGIN
  -- Only women can create women-only rides
  IF NEW.is_women_only = TRUE THEN
    SELECT gender INTO v_driver_gender
    FROM public.profiles
    WHERE id = NEW.driver_id;

    IF v_driver_gender IS NULL THEN
      RAISE EXCEPTION 'Driver profile not found. Please complete your profile first.';
    END IF;

    IF v_driver_gender != 'female' THEN
      RAISE EXCEPTION 'Only women can create women-only rides. Please update your gender in profile settings.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
