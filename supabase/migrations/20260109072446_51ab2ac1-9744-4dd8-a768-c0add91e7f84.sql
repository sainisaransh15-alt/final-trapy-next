-- Create recurring_rides table for scheduled repeating rides
CREATE TABLE public.recurring_rides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIME NOT NULL,
  price_per_seat NUMERIC NOT NULL,
  seats_available INTEGER NOT NULL DEFAULT 3,
  car_model TEXT,
  car_number TEXT,
  is_women_only BOOLEAN DEFAULT false,
  is_pet_friendly BOOLEAN DEFAULT false,
  is_smoking_allowed BOOLEAN DEFAULT false,
  is_music_allowed BOOLEAN DEFAULT true,
  is_chatty BOOLEAN DEFAULT true,
  max_two_back_seat BOOLEAN DEFAULT false,
  instant_approval BOOLEAN DEFAULT false,
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily', 'weekly', 'monthly')),
  recurrence_days INTEGER[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  next_publish_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on recurring_rides
ALTER TABLE public.recurring_rides ENABLE ROW LEVEL SECURITY;

-- RLS policies for recurring_rides
CREATE POLICY "Users can view their own recurring rides"
ON public.recurring_rides FOR SELECT
USING (auth.uid() = driver_id);

CREATE POLICY "Users can create their own recurring rides"
ON public.recurring_rides FOR INSERT
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Users can update their own recurring rides"
ON public.recurring_rides FOR UPDATE
USING (auth.uid() = driver_id);

CREATE POLICY "Users can delete their own recurring rides"
ON public.recurring_rides FOR DELETE
USING (auth.uid() = driver_id);

-- Create reports table for user/ride reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('harassment', 'fake_profile', 'inappropriate_behavior', 'safety_concern', 'spam', 'other')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT reports_must_have_target CHECK (reported_user_id IS NOT NULL OR reported_ride_id IS NOT NULL)
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for reports
CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports"
ON public.reports FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger for recurring_rides
CREATE TRIGGER update_recurring_rides_updated_at
BEFORE UPDATE ON public.recurring_rides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get driver earnings with daily breakdown for charts
CREATE OR REPLACE FUNCTION public.get_driver_earnings_breakdown(
  p_driver_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  earnings NUMERIC,
  rides_count BIGINT,
  bookings_count BIGINT,
  seats_sold BIGINT
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (p_days - 1),
      CURRENT_DATE,
      '1 day'::interval
    )::date AS date
  )
  SELECT 
    ds.date,
    COALESCE(SUM(b.total_price - b.platform_fee) FILTER (WHERE b.status = 'confirmed'), 0) as earnings,
    COUNT(DISTINCT r.id) FILTER (WHERE r.created_at::date = ds.date) as rides_count,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'confirmed') as bookings_count,
    COALESCE(SUM(b.seats_booked) FILTER (WHERE b.status = 'confirmed'), 0)::bigint as seats_sold
  FROM date_series ds
  LEFT JOIN public.rides r ON r.driver_id = p_driver_id AND r.created_at::date <= ds.date
  LEFT JOIN public.bookings b ON b.ride_id = r.id AND b.created_at::date = ds.date
  GROUP BY ds.date
  ORDER BY ds.date;
$$;