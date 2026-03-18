-- Grant execute permissions for daily platform revenue function
GRANT EXECUTE ON FUNCTION public.get_daily_platform_revenue(INTEGER) TO authenticated;
