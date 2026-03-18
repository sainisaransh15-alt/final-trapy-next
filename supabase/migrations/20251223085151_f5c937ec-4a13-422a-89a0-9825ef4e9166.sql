-- Fix security definer view issue by using a function instead
DROP VIEW IF EXISTS public.driver_earnings;

-- Create a secure function to get driver earnings (RLS-compliant)
CREATE OR REPLACE FUNCTION public.get_driver_earnings(p_driver_id uuid)
RETURNS TABLE (
  total_rides bigint,
  total_bookings bigint,
  total_seats_sold bigint,
  total_earnings numeric,
  today_earnings numeric,
  week_earnings numeric,
  month_earnings numeric,
  cancelled_bookings bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    COUNT(DISTINCT r.id) as total_rides,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'confirmed') as total_bookings,
    COALESCE(SUM(b.seats_booked) FILTER (WHERE b.status = 'confirmed'), 0)::bigint as total_seats_sold,
    COALESCE(SUM(b.total_price - b.platform_fee) FILTER (WHERE b.status = 'confirmed'), 0) as total_earnings,
    COALESCE(SUM(b.total_price - b.platform_fee) FILTER (WHERE b.status = 'confirmed' AND b.created_at >= date_trunc('day', now())), 0) as today_earnings,
    COALESCE(SUM(b.total_price - b.platform_fee) FILTER (WHERE b.status = 'confirmed' AND b.created_at >= date_trunc('week', now())), 0) as week_earnings,
    COALESCE(SUM(b.total_price - b.platform_fee) FILTER (WHERE b.status = 'confirmed' AND b.created_at >= date_trunc('month', now())), 0) as month_earnings,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'cancelled') as cancelled_bookings
  FROM public.rides r
  LEFT JOIN public.bookings b ON b.ride_id = r.id
  WHERE r.driver_id = p_driver_id
    AND r.status IN ('active', 'started', 'completed')
$$;