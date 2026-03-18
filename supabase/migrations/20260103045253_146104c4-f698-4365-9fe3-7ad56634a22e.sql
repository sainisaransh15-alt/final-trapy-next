-- Create security definer functions to break RLS recursion

-- Function to check if user is the driver of a ride
CREATE OR REPLACE FUNCTION public.is_ride_driver(p_ride_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rides
    WHERE id = p_ride_id AND driver_id = p_user_id
  )
$$;

-- Function to check if user is a passenger on a ride
CREATE OR REPLACE FUNCTION public.is_ride_passenger(p_ride_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE ride_id = p_ride_id AND passenger_id = p_user_id
  )
$$;

-- Function to get driver_id for a booking without RLS
CREATE OR REPLACE FUNCTION public.get_booking_driver_id(p_booking_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.driver_id 
  FROM public.bookings b
  JOIN public.rides r ON r.id = b.ride_id
  WHERE b.id = p_booking_id
$$;

-- Drop and recreate problematic policies on bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings
FOR SELECT USING (
  auth.uid() = passenger_id 
  OR public.is_ride_driver(ride_id, auth.uid())
);

-- Drop and recreate problematic policies on rides
DROP POLICY IF EXISTS "Passengers can view booked rides" ON public.rides;
CREATE POLICY "Passengers can view booked rides" ON public.rides
FOR SELECT USING (
  public.is_ride_passenger(id, auth.uid())
);