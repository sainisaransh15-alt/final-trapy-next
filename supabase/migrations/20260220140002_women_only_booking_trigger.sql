-- Create trigger for women-only booking validation
DROP TRIGGER IF EXISTS validate_women_only_booking_trigger ON public.bookings;
CREATE TRIGGER validate_women_only_booking_trigger
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_women_only_booking();
