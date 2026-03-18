-- Fix admin_review_document function to properly cast role
CREATE OR REPLACE FUNCTION public.admin_review_document(p_doc_id uuid, p_action text, p_user_id uuid, p_doc_type text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify admin role server-side with proper cast
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Validate action
  IF p_action NOT IN ('verified', 'rejected') THEN
    RAISE EXCEPTION 'Invalid action. Must be verified or rejected.';
  END IF;
  
  -- Validate document type
  IF p_doc_type NOT IN ('aadhaar', 'driving_license') THEN
    RAISE EXCEPTION 'Invalid document type';
  END IF;

  -- Update document status
  UPDATE public.verification_documents
  SET status = p_action::verification_status, reviewed_at = NOW()
  WHERE id = p_doc_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found';
  END IF;
  
  -- Update profile verification status
  IF p_action = 'verified' THEN
    IF p_doc_type = 'aadhaar' THEN
      UPDATE public.profiles
      SET is_aadhaar_verified = TRUE, aadhaar_status = 'verified'::verification_status
      WHERE id = p_user_id;
    ELSE
      UPDATE public.profiles
      SET is_dl_verified = TRUE, dl_status = 'verified'::verification_status
      WHERE id = p_user_id;
    END IF;
  ELSIF p_action = 'rejected' THEN
    IF p_doc_type = 'aadhaar' THEN
      UPDATE public.profiles
      SET aadhaar_status = 'rejected'::verification_status
      WHERE id = p_user_id;
    ELSE
      UPDATE public.profiles
      SET dl_status = 'rejected'::verification_status
      WHERE id = p_user_id;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Fix get_document_signed_url function to properly cast role
CREATE OR REPLACE FUNCTION public.get_document_signed_url(p_doc_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_file_path TEXT;
  v_user_id UUID;
  v_is_owner BOOLEAN;
  v_is_admin BOOLEAN;
BEGIN
  -- Get document info
  SELECT document_url, user_id INTO v_file_path, v_user_id
  FROM public.verification_documents
  WHERE id = p_doc_id;
  
  IF v_file_path IS NULL THEN
    RAISE EXCEPTION 'Document not found';
  END IF;
  
  -- Check authorization: user is owner or admin (with proper cast)
  v_is_owner := (auth.uid() = v_user_id);
  v_is_admin := public.has_role(auth.uid(), 'admin'::app_role);
  
  IF NOT (v_is_owner OR v_is_admin) THEN
    RAISE EXCEPTION 'Not authorized to view this document';
  END IF;
  
  -- Return the file path - signed URL must be generated client-side
  RETURN v_file_path;
END;
$function$;