-- Grant execute permissions for new revenue functions
GRANT EXECUTE ON FUNCTION public.get_platform_revenue_summary(INTEGER) TO authenticated;
