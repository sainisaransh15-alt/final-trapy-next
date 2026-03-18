-- Update admin analytics to include platform revenue
-- Need to DROP first because we're adding a new column to the return type
DROP FUNCTION IF EXISTS public.get_admin_analytics(INTEGER);

CREATE OR REPLACE FUNCTION public.get_admin_analytics(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  total_rides BIGINT,
  total_bookings BIGINT,
  total_revenue NUMERIC,
  platform_revenue NUMERIC,
  new_users BIGINT,
  active_users BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (p_days - 1),
      CURRENT_DATE,
      '1 day'::interval
    )::date AS date
  ),
  daily_rides AS (
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM public.rides
    WHERE created_at >= CURRENT_DATE - p_days
    GROUP BY DATE(created_at)
  ),
  daily_bookings AS (
    SELECT 
      DATE(created_at) as date, 
      COUNT(*) as count, 
      SUM(total_price) as revenue,
      SUM(platform_fee) as platform_revenue
    FROM public.bookings
    WHERE created_at >= CURRENT_DATE - p_days AND status = 'confirmed'
    GROUP BY DATE(created_at)
  ),
  daily_users AS (
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM public.profiles
    WHERE created_at >= CURRENT_DATE - p_days
    GROUP BY DATE(created_at)
  ),
  daily_active AS (
    SELECT DATE(created_at) as date, COUNT(DISTINCT passenger_id) as count
    FROM public.bookings
    WHERE created_at >= CURRENT_DATE - p_days
    GROUP BY DATE(created_at)
  )
  SELECT 
    ds.date,
    COALESCE(dr.count, 0) as total_rides,
    COALESCE(db.count, 0) as total_bookings,
    COALESCE(db.revenue, 0) as total_revenue,
    COALESCE(db.platform_revenue, 0) as platform_revenue,
    COALESCE(du.count, 0) as new_users,
    COALESCE(da.count, 0) as active_users
  FROM date_series ds
  LEFT JOIN daily_rides dr ON ds.date = dr.date
  LEFT JOIN daily_bookings db ON ds.date = db.date
  LEFT JOIN daily_users du ON ds.date = du.date
  LEFT JOIN daily_active da ON ds.date = da.date
  ORDER BY ds.date;
$$;
