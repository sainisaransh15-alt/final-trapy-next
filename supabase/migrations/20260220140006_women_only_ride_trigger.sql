-- Create or recreate trigger for women-only ride creation validation
DROP TRIGGER IF EXISTS validate_women_only_ride_trigger ON public.rides;
CREATE TRIGGER validate_women_only_ride_trigger
  BEFORE INSERT OR UPDATE ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_women_only_ride();
