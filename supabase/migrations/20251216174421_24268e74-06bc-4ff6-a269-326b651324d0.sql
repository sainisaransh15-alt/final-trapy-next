-- Create messages table for chat between passengers and drivers
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies - only booking participants can view/send
CREATE POLICY "Booking participants can view messages"
ON public.messages FOR SELECT
USING (
  sender_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.rides r ON b.ride_id = r.id
    WHERE b.id = messages.booking_id
    AND (b.passenger_id = auth.uid() OR r.driver_id = auth.uid())
  )
);

CREATE POLICY "Booking participants can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.rides r ON b.ride_id = r.id
    WHERE b.id = booking_id
    AND (b.passenger_id = auth.uid() OR r.driver_id = auth.uid())
  )
);

-- Create pickup_points table
CREATE TABLE public.pickup_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  sequence_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pickup_points
ALTER TABLE public.pickup_points ENABLE ROW LEVEL SECURITY;

-- Anyone can view pickup points for active rides
CREATE POLICY "Anyone can view pickup points"
ON public.pickup_points FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.rides r
    WHERE r.id = pickup_points.ride_id AND r.status = 'active'
  )
);

-- Drivers can manage their ride's pickup points
CREATE POLICY "Drivers can insert pickup points"
ON public.pickup_points FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rides r
    WHERE r.id = ride_id AND r.driver_id = auth.uid()
  )
);

CREATE POLICY "Drivers can update pickup points"
ON public.pickup_points FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.rides r
    WHERE r.id = pickup_points.ride_id AND r.driver_id = auth.uid()
  )
);

CREATE POLICY "Drivers can delete pickup points"
ON public.pickup_points FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.rides r
    WHERE r.id = pickup_points.ride_id AND r.driver_id = auth.uid()
  )
);

-- Add pickup_point_id to bookings table
ALTER TABLE public.bookings ADD COLUMN pickup_point_id UUID REFERENCES public.pickup_points(id);

-- Create ratings table for two-way ratings
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL,
  rated_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  rater_type TEXT NOT NULL CHECK (rater_type IN ('driver', 'passenger')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id, rater_id)
);

-- Enable RLS on ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view ratings
CREATE POLICY "Anyone can view ratings"
ON public.ratings FOR SELECT
USING (true);

-- Booking participants can create ratings
CREATE POLICY "Booking participants can create ratings"
ON public.ratings FOR INSERT
WITH CHECK (
  auth.uid() = rater_id AND
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.rides r ON b.ride_id = r.id
    WHERE b.id = booking_id
    AND (
      (b.passenger_id = auth.uid() AND rated_id = r.driver_id AND rater_type = 'passenger') OR
      (r.driver_id = auth.uid() AND rated_id = b.passenger_id AND rater_type = 'driver')
    )
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;