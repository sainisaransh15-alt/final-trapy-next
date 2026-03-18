
-- Add referral_code and is_suspended to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Create referrals table for tracking referrals
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  referrer_reward NUMERIC DEFAULT 50,
  referred_reward NUMERIC DEFAULT 25,
  completed_at TIMESTAMP WITH TIME ZONE,
  rewarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_ride_amount NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_first_ride_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promo_code_usage table to track who used what
CREATE TABLE public.promo_code_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  discount_applied NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(promo_code_id, user_id, booking_id)
);

-- Enable RLS on new tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals as referrer"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view their own referral as referred"
ON public.referrals FOR SELECT
USING (auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
ON public.referrals FOR INSERT
WITH CHECK (auth.uid() = referred_id);

-- RLS policies for promo_codes (public read for active codes)
CREATE POLICY "Anyone can view active promo codes"
ON public.promo_codes FOR SELECT
USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage promo codes"
ON public.promo_codes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for promo_code_usage
CREATE POLICY "Users can view their own promo usage"
ON public.promo_code_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own promo usage"
ON public.promo_code_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all promo usage"
ON public.promo_code_usage FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin policies for profiles management
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'TRAPY' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  NEW.referral_code := new_code;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral code on profile creation
CREATE TRIGGER generate_referral_code_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.referral_code IS NULL)
EXECUTE FUNCTION public.generate_referral_code();

-- Function to process referral reward when referred user completes first ride
CREATE OR REPLACE FUNCTION public.process_referral_reward()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_referral RECORD;
BEGIN
  -- Only process on confirmed bookings
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    -- Check if user has a pending referral
    SELECT * INTO v_referral
    FROM public.referrals
    WHERE referred_id = NEW.passenger_id AND status = 'pending'
    FOR UPDATE;
    
    IF v_referral IS NOT NULL THEN
      -- Mark referral as completed
      UPDATE public.referrals
      SET status = 'completed', completed_at = now()
      WHERE id = v_referral.id;
      
      -- Credit rewards to both users' wallets
      UPDATE public.profiles
      SET wallet_balance = COALESCE(wallet_balance, 0) + v_referral.referrer_reward
      WHERE id = v_referral.referrer_id;
      
      UPDATE public.profiles
      SET wallet_balance = COALESCE(wallet_balance, 0) + v_referral.referred_reward
      WHERE id = v_referral.referred_id;
      
      -- Mark as rewarded
      UPDATE public.referrals
      SET status = 'rewarded', rewarded_at = now()
      WHERE id = v_referral.id;
      
      -- Create notifications
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES 
        (v_referral.referrer_id, 'referral_reward', 'Referral Reward!', 
         'Your friend completed their first ride! ₹' || v_referral.referrer_reward || ' credited to your wallet.',
         jsonb_build_object('referral_id', v_referral.id, 'amount', v_referral.referrer_reward)),
        (v_referral.referred_id, 'referral_bonus', 'Welcome Bonus!', 
         'Congrats on your first ride! ₹' || v_referral.referred_reward || ' credited to your wallet.',
         jsonb_build_object('referral_id', v_referral.id, 'amount', v_referral.referred_reward));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for referral rewards
CREATE TRIGGER process_referral_on_booking
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.process_referral_reward();

-- Function to get admin analytics
CREATE OR REPLACE FUNCTION public.get_admin_analytics(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  total_rides BIGINT,
  total_bookings BIGINT,
  total_revenue NUMERIC,
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
    SELECT DATE(created_at) as date, COUNT(*) as count, SUM(total_price) as revenue
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
    COALESCE(du.count, 0) as new_users,
    COALESCE(da.count, 0) as active_users
  FROM date_series ds
  LEFT JOIN daily_rides dr ON ds.date = dr.date
  LEFT JOIN daily_bookings db ON ds.date = db.date
  LEFT JOIN daily_users du ON ds.date = du.date
  LEFT JOIN daily_active da ON ds.date = da.date
  ORDER BY ds.date;
$$;

-- Update existing profiles to have referral codes
UPDATE public.profiles 
SET referral_code = 'TRAPY' || UPPER(SUBSTRING(MD5(id::TEXT || RANDOM()::TEXT) FROM 1 FOR 6))
WHERE referral_code IS NULL;
