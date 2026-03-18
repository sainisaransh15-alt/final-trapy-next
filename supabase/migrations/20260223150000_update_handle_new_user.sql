-- =====================================================
-- Update handle_new_user to extract Google profile data
-- This extracts name, avatar, and potentially inferred data
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_email TEXT;
BEGIN
  -- Extract full_name from various possible metadata locations
  v_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'user_name',
    ''
  );
  
  -- Extract avatar_url from various possible metadata locations
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'picture',
    ''
  );
  
  -- Get email for reference
  v_email := COALESCE(NEW.email, '');
  
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url
    -- Note: Gender is NOT available from Google OAuth by default
    -- Users must set it during onboarding
  )
  VALUES (
    NEW.id,
    v_full_name,
    v_avatar_url
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
    
  RETURN NEW;
END;
$$;

-- =====================================================
-- Note: Google OAuth does NOT provide gender by default
-- The 'profile' scope only gives: name, email, picture
-- Gender requires special permissions that Google has restricted
-- So gender MUST be collected during onboarding
-- =====================================================
