-- Create storage buckets for documents and avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies for avatars (public read, authenticated write own)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for documents (private, only owner can access)
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fix RLS policy for rides visibility - allow drivers to see all their rides regardless of status
DROP POLICY IF EXISTS "Drivers can view own rides" ON public.rides;
CREATE POLICY "Drivers can view own rides"
ON public.rides FOR SELECT
USING (auth.uid() = driver_id);

-- Allow passengers to view rides they have bookings for (any status)
CREATE POLICY "Passengers can view booked rides"
ON public.rides FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.ride_id = rides.id
    AND bookings.passenger_id = auth.uid()
  )
);

-- Add phone_otp_sent_at column for rate limiting OTP
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_otp_sent_at timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_otp_code text;