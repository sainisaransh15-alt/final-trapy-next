-- Security Fix: Admin verification with server-side enforcement
-- This migration adds proper RLS policies and creates a secure RPC function for admin document review

-- 1. Add SELECT policy for admins to view all verification documents
CREATE POLICY "Admins can view all verification documents"
  ON public.verification_documents FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Create secure admin document review function (SECURITY DEFINER)
-- This enforces admin authorization server-side and atomically updates both tables
CREATE OR REPLACE FUNCTION public.admin_review_document(
  p_doc_id UUID,
  p_action TEXT,
  p_user_id UUID,
  p_doc_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin role server-side
  IF NOT public.has_role(auth.uid(), 'admin') THEN
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
$$;

-- 3. Create function for users to get signed URL for their documents
-- This avoids storing public URLs and uses time-limited signed access
CREATE OR REPLACE FUNCTION public.get_document_signed_url(
  p_doc_id UUID
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Check authorization: user is owner or admin
  v_is_owner := (auth.uid() = v_user_id);
  v_is_admin := public.has_role(auth.uid(), 'admin');
  
  IF NOT (v_is_owner OR v_is_admin) THEN
    RAISE EXCEPTION 'Not authorized to view this document';
  END IF;
  
  -- Return the file path - signed URL must be generated client-side
  -- because Supabase signed URL generation requires client SDK
  RETURN v_file_path;
END;
$$;

-- 4. Add admin policy to storage for viewing documents
CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));