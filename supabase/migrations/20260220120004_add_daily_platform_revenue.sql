-- Create daily platform revenue breakdown
CREATE OR REPLACE FUNCTION public.get_daily_platform_revenue(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  bookings_count BIGINT,
  transaction_value NUMERIC,
  platform_revenue NUMERIC,
  driver_payouts NUMERIC
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
  daily_revenue AS (
    SELECT 
      DATE(created_at) as date, 
      COUNT(*) as bookings_count,
      COALESCE(SUM(total_price), 0) as transaction_value,
      COALESCE(SUM(platform_fee), 0) as platform_revenue,
      COALESCE(SUM(total_price - platform_fee), 0) as driver_payouts
    FROM public.bookings
    WHERE status = 'confirmed'
      AND created_at >= CURRENT_DATE - p_days
    GROUP BY DATE(created_at)
  )
  SELECT 
    ds.date,
    COALESCE(dr.bookings_count, 0)::BIGINT as bookings_count,
    COALESCE(dr.transaction_value, 0) as transaction_value,
    COALESCE(dr.platform_revenue, 0) as platform_revenue,
    COALESCE(dr.driver_payouts, 0) as driver_payouts
  FROM date_series ds
  LEFT JOIN daily_revenue dr ON ds.date = dr.date
  ORDER BY ds.date;
$$;
