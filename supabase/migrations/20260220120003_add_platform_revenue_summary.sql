-- Create admin revenue summary function
CREATE OR REPLACE FUNCTION public.get_platform_revenue_summary(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_bookings BIGINT,
  total_transaction_value NUMERIC,
  total_platform_revenue NUMERIC,
  total_driver_payouts NUMERIC,
  average_platform_fee_percentage NUMERIC
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COUNT(*)::BIGINT as total_bookings,
    COALESCE(SUM(total_price), 0) as total_transaction_value,
    COALESCE(SUM(platform_fee), 0) as total_platform_revenue,
    COALESCE(SUM(total_price - platform_fee), 0) as total_driver_payouts,
    CASE 
      WHEN SUM(total_price) > 0 
      THEN ROUND((SUM(platform_fee) / SUM(total_price)) * 100, 2)
      ELSE 0 
    END as average_platform_fee_percentage
  FROM public.bookings
  WHERE status = 'confirmed'
    AND created_at >= CURRENT_DATE - p_days;
$$;
