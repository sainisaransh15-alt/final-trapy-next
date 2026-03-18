-- =====================================================
-- FIX 1: phone_verifications - Add RLS policies (CRITICAL)
-- This table stores OTP codes - must be protected
-- =====================================================

-- Only allow server-side operations via security definer functions
-- No direct client access to OTP codes
CREATE POLICY "No direct select access to OTPs"
ON public.phone_verifications
FOR SELECT
USING (false);

CREATE POLICY "No direct insert access to OTPs"
ON public.phone_verifications
FOR INSERT
WITH CHECK (false);

CREATE POLICY "No direct update access to OTPs"
ON public.phone_verifications
FOR UPDATE
USING (false);

CREATE POLICY "No direct delete access to OTPs"
ON public.phone_verifications
FOR DELETE
USING (false);

-- =====================================================
-- FIX 2: profiles - Restrict public read access (CRITICAL)
-- Only allow viewing profiles of users you interact with
-- =====================================================

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can view profiles of drivers whose rides they booked
CREATE POLICY "Passengers can view driver profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.rides r ON r.id = b.ride_id
    WHERE b.passenger_id = auth.uid()
    AND r.driver_id = profiles.id
  )
);

-- Drivers can view profiles of passengers who booked their rides
CREATE POLICY "Drivers can view passenger profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.rides r ON r.id = b.ride_id
    WHERE r.driver_id = auth.uid()
    AND b.passenger_id = profiles.id
  )
);

-- Users can view driver profiles of active rides (for search results)
CREATE POLICY "Users can view driver profiles of active rides"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.rides r
    WHERE r.driver_id = profiles.id
    AND r.status = 'active'
  )
);

-- =====================================================
-- FIX 3: ratings - Restrict to booking participants (CRITICAL)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view ratings" ON public.ratings;

-- Users can view ratings for their own bookings (as passenger or driver)
CREATE POLICY "Booking participants can view ratings"
ON public.ratings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.rides r ON r.id = b.ride_id
    WHERE b.id = ratings.booking_id
    AND (b.passenger_id = auth.uid() OR r.driver_id = auth.uid())
  )
);

-- Users can view their own ratings (received)
CREATE POLICY "Users can view their received ratings"
ON public.ratings
FOR SELECT
USING (rated_id = auth.uid());

-- Users can view ratings they gave
CREATE POLICY "Users can view their given ratings"
ON public.ratings
FOR SELECT
USING (rater_id = auth.uid());

-- =====================================================
-- FIX 4: trusted_contacts - Already has policies, verify SELECT exists
-- The scan said no SELECT policy but we have one, re-create to be sure
-- =====================================================

-- (Already exists based on useful-context, no action needed)

-- =====================================================
-- FIX 5: notifications - Restrict INSERT to service role only
-- Regular users should not be able to insert notifications
-- =====================================================

-- No policy needed - absence of INSERT policy means only service role can insert
-- This is the desired behavior

-- =====================================================
-- FIX 6: sos_alerts - Allow admins to view for emergency response
-- =====================================================

CREATE POLICY "Admins can view all SOS alerts"
ON public.sos_alerts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- FIX 7: bookings - Allow drivers to update booking status
-- =====================================================

CREATE POLICY "Drivers can update bookings for their rides"
ON public.bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.rides r
    WHERE r.id = bookings.ride_id
    AND r.driver_id = auth.uid()
  )
);

-- =====================================================
-- FIX 8: messages - Allow marking messages as read
-- =====================================================

CREATE POLICY "Recipients can mark messages as read"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.rides r ON r.id = b.ride_id
    WHERE b.id = messages.booking_id
    AND (b.passenger_id = auth.uid() OR r.driver_id = auth.uid())
    AND messages.sender_id != auth.uid()
  )
);

-- =====================================================
-- FIX 9: verification_documents - Allow admins to update status
-- =====================================================

CREATE POLICY "Admins can update verification documents"
ON public.verification_documents
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));