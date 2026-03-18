-- Grant admin access to ridantgunjar@gmail.com
-- This migration adds the admin role for the specified user

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find the user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'ridantgunjar@gmail.com'
  LIMIT 1;

  -- If user exists, grant admin role
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin role granted to ridantgunjar@gmail.com';
  ELSE
    RAISE NOTICE 'User ridantgunjar@gmail.com not found. They need to sign up first.';
  END IF;
END $$;
