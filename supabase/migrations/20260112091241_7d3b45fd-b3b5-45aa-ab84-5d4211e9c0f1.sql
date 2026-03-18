-- Add 'booking_created' to the notifications type check constraint
ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
  'booking_request'::text, 
  'booking_confirmed'::text, 
  'booking_cancelled'::text, 
  'booking_created'::text,
  'new_message'::text, 
  'ride_reminder'::text, 
  'ride_started'::text, 
  'ride_completed'::text, 
  'sos_alert'::text,
  'system'::text,
  'promo'::text
]));