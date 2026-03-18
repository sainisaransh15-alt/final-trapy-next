-- Fix 1: Update validate_message_content() to strip HTML tags for XSS protection
CREATE OR REPLACE FUNCTION public.validate_message_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Strip HTML tags for XSS protection (defense-in-depth)
  NEW.content := regexp_replace(NEW.content, '<[^>]*>', '', 'g');
  
  -- Check message length (max 1000 characters)
  IF LENGTH(NEW.content) > 1000 THEN
    RAISE EXCEPTION 'Message too long (max 1000 characters)';
  END IF;
  
  -- Check for empty/whitespace-only messages
  IF TRIM(NEW.content) = '' THEN
    RAISE EXCEPTION 'Message cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix 2: Create audit log table for admin report modifications
CREATE TABLE IF NOT EXISTS public.report_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit log table
ALTER TABLE public.report_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view report audit logs"
  ON public.report_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.log_report_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.report_audit_log (
    report_id,
    admin_id,
    action,
    old_values,
    new_values
  ) VALUES (
    NEW.id,
    auth.uid(),
    TG_OP,
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the audit trigger on reports table
DROP TRIGGER IF EXISTS audit_report_changes ON public.reports;
CREATE TRIGGER audit_report_changes
  AFTER UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.log_report_audit();