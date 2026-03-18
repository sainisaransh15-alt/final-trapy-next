-- =====================================================
-- PHASE 2, 3, 4: Comprehensive Database Updates
-- =====================================================

-- 1. Add ride status transitions (active → started → completed)
-- Already has 'status' column, just need to ensure valid values

-- 2. Add instant_approval to rides table
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS instant_approval boolean DEFAULT false;

-- 3. Create trusted_contacts table for safety features
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trusted contacts"
  ON public.trusted_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trusted contacts"
  ON public.trusted_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trusted contacts"
  ON public.trusted_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trusted contacts"
  ON public.trusted_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create SOS alerts table for emergency logging
CREATE TABLE IF NOT EXISTS public.sos_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ride_id uuid REFERENCES public.rides(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('sos', 'share_location', 'share_ride')),
  latitude numeric,
  longitude numeric,
  location_text text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create SOS alerts"
  ON public.sos_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own SOS alerts"
  ON public.sos_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own SOS alerts"
  ON public.sos_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Create push_subscriptions table for web push notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('booking_request', 'booking_confirmed', 'booking_cancelled', 'new_message', 'ride_reminder', 'ride_started', 'ride_completed', 'sos_alert')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 7. Create saved_searches table
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin text NOT NULL,
  destination text NOT NULL,
  name text,
  notify_enabled boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved searches"
  ON public.saved_searches FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Create user_roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user has a specific role (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. Create driver_earnings view for earnings dashboard
CREATE OR REPLACE VIEW public.driver_earnings AS
SELECT 
  r.driver_id,
  COUNT(DISTINCT r.id) as total_rides,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'confirmed') as total_bookings,
  COALESCE(SUM(b.seats_booked) FILTER (WHERE b.status = 'confirmed'), 0) as total_seats_sold,
  COALESCE(SUM(b.total_price - b.platform_fee) FILTER (WHERE b.status = 'confirmed'), 0) as total_earnings,
  COALESCE(SUM(b.total_price - b.platform_fee) FILTER (WHERE b.status = 'confirmed' AND b.created_at >= date_trunc('day', now())), 0) as today_earnings,
  COALESCE(SUM(b.total_price - b.platform_fee) FILTER (WHERE b.status = 'confirmed' AND b.created_at >= date_trunc('week', now())), 0) as week_earnings,
  COALESCE(SUM(b.total_price - b.platform_fee) FILTER (WHERE b.status = 'confirmed' AND b.created_at >= date_trunc('month', now())), 0) as month_earnings,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'cancelled') as cancelled_bookings
FROM public.rides r
LEFT JOIN public.bookings b ON b.ride_id = r.id
WHERE r.status IN ('active', 'started', 'completed')
GROUP BY r.driver_id;

-- 10. Function to start a ride (driver only)
CREATE OR REPLACE FUNCTION public.start_ride(p_ride_id uuid, p_driver_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ride RECORD;
BEGIN
  SELECT * INTO v_ride FROM public.rides WHERE id = p_ride_id FOR UPDATE;
  
  IF v_ride IS NULL THEN
    RAISE EXCEPTION 'Ride not found';
  END IF;
  
  IF v_ride.driver_id != p_driver_id THEN
    RAISE EXCEPTION 'Only the driver can start this ride';
  END IF;
  
  IF v_ride.status != 'active' THEN
    RAISE EXCEPTION 'Ride cannot be started (current status: %)', v_ride.status;
  END IF;
  
  UPDATE public.rides SET status = 'started', updated_at = now() WHERE id = p_ride_id;
  
  -- Create notifications for all confirmed passengers
  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT 
    b.passenger_id,
    'ride_started',
    'Your ride has started!',
    'Driver has started the ride from ' || v_ride.origin,
    jsonb_build_object('ride_id', p_ride_id, 'booking_id', b.id)
  FROM public.bookings b
  WHERE b.ride_id = p_ride_id AND b.status = 'confirmed';
  
  RETURN TRUE;
END;
$$;

-- 11. Function to complete a ride (driver only)
CREATE OR REPLACE FUNCTION public.complete_ride(p_ride_id uuid, p_driver_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ride RECORD;
BEGIN
  SELECT * INTO v_ride FROM public.rides WHERE id = p_ride_id FOR UPDATE;
  
  IF v_ride IS NULL THEN
    RAISE EXCEPTION 'Ride not found';
  END IF;
  
  IF v_ride.driver_id != p_driver_id THEN
    RAISE EXCEPTION 'Only the driver can complete this ride';
  END IF;
  
  IF v_ride.status != 'started' THEN
    RAISE EXCEPTION 'Ride must be started before completing (current status: %)', v_ride.status;
  END IF;
  
  UPDATE public.rides SET status = 'completed', updated_at = now() WHERE id = p_ride_id;
  
  -- Update driver's total_rides count
  UPDATE public.profiles 
  SET total_rides = COALESCE(total_rides, 0) + 1
  WHERE id = p_driver_id;
  
  -- Create notifications for all confirmed passengers
  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT 
    b.passenger_id,
    'ride_completed',
    'Ride completed!',
    'You have arrived at ' || v_ride.destination || '. Please rate your driver.',
    jsonb_build_object('ride_id', p_ride_id, 'booking_id', b.id)
  FROM public.bookings b
  WHERE b.ride_id = p_ride_id AND b.status = 'confirmed';
  
  RETURN TRUE;
END;
$$;

-- 12. Auto-confirm bookings when instant_approval is enabled
CREATE OR REPLACE FUNCTION public.handle_instant_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_instant_approval boolean;
BEGIN
  SELECT instant_approval INTO v_instant_approval
  FROM public.rides
  WHERE id = NEW.ride_id;
  
  IF v_instant_approval = TRUE THEN
    NEW.status := 'confirmed';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_instant_approval
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_instant_approval();

-- 13. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 14. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_bookings_ride_status ON public.bookings(ride_id, status);
CREATE INDEX IF NOT EXISTS idx_rides_driver_status ON public.rides(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_user ON public.sos_alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches(user_id);