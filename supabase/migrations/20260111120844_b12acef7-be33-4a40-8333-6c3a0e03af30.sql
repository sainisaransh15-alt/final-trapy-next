-- Add FCM support columns to push_subscriptions table
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS fcm_token TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'web',
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';

-- Add email column to profiles if not exists (for notification purposes)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT true;

-- Create a function to call the send-notification edge function
CREATE OR REPLACE FUNCTION public.notify_booking_created()
RETURNS TRIGGER AS $$
DECLARE
  driver_id UUID;
  passenger_name TEXT;
  ride_origin TEXT;
  ride_destination TEXT;
  ride_departure TIMESTAMP;
BEGIN
  -- Get ride and driver info
  SELECT r.driver_id, r.origin, r.destination, r.departure_time
  INTO driver_id, ride_origin, ride_destination, ride_departure
  FROM public.rides r
  WHERE r.id = NEW.ride_id;

  -- Get passenger name
  SELECT full_name INTO passenger_name
  FROM public.profiles
  WHERE id = NEW.passenger_id;

  -- Insert notification for driver
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    driver_id,
    'booking_created',
    'New Booking Request',
    COALESCE(passenger_name, 'A passenger') || ' wants to book ' || NEW.seats_booked || ' seat(s) for your ride from ' || ride_origin || ' to ' || ride_destination,
    jsonb_build_object(
      'booking_id', NEW.id,
      'ride_id', NEW.ride_id,
      'passenger_id', NEW.passenger_id,
      'seats_booked', NEW.seats_booked,
      'departure_time', ride_departure
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for booking created
DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
CREATE TRIGGER on_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_booking_created();

-- Create function for booking status changes
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
  driver_id UUID;
  driver_name TEXT;
  passenger_name TEXT;
  ride_origin TEXT;
  ride_destination TEXT;
  ride_departure TIMESTAMP;
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get ride info
  SELECT r.driver_id, r.origin, r.destination, r.departure_time
  INTO driver_id, ride_origin, ride_destination, ride_departure
  FROM public.rides r
  WHERE r.id = NEW.ride_id;

  -- Get names
  SELECT full_name INTO driver_name FROM public.profiles WHERE id = driver_id;
  SELECT full_name INTO passenger_name FROM public.profiles WHERE id = NEW.passenger_id;

  -- Handle different status changes
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    notification_type := 'booking_confirmed';
    notification_title := 'Booking Confirmed!';
    notification_message := 'Your booking for ' || ride_origin || ' to ' || ride_destination || ' has been confirmed by ' || COALESCE(driver_name, 'the driver');
    
    -- Notify passenger
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.passenger_id,
      notification_type,
      notification_title,
      notification_message,
      jsonb_build_object(
        'booking_id', NEW.id,
        'ride_id', NEW.ride_id,
        'departure_time', ride_departure
      )
    );

  ELSIF NEW.status = 'cancelled' THEN
    notification_type := 'booking_cancelled';
    notification_title := 'Booking Cancelled';
    
    -- Notify the other party
    IF OLD.status = 'pending' OR OLD.status = 'confirmed' THEN
      -- Notify passenger if driver cancelled
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        NEW.passenger_id,
        notification_type,
        notification_title,
        'Your booking for ' || ride_origin || ' to ' || ride_destination || ' has been cancelled',
        jsonb_build_object(
          'booking_id', NEW.id,
          'ride_id', NEW.ride_id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for booking status change
DROP TRIGGER IF EXISTS on_booking_status_change ON public.bookings;
CREATE TRIGGER on_booking_status_change
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_booking_status_change();

-- Create function for ride status changes
CREATE OR REPLACE FUNCTION public.notify_ride_status_change()
RETURNS TRIGGER AS $$
DECLARE
  passenger_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Handle ride started
  IF NEW.status = 'in_progress' AND OLD.status = 'active' THEN
    notification_type := 'ride_started';
    notification_title := 'Your Ride Has Started!';
    notification_message := 'The ride from ' || NEW.origin || ' to ' || NEW.destination || ' has started';
    
    -- Notify all confirmed passengers
    FOR passenger_record IN
      SELECT passenger_id FROM public.bookings 
      WHERE ride_id = NEW.id AND status = 'confirmed'
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        passenger_record.passenger_id,
        notification_type,
        notification_title,
        notification_message,
        jsonb_build_object(
          'ride_id', NEW.id,
          'driver_id', NEW.driver_id
        )
      );
    END LOOP;

  -- Handle ride completed
  ELSIF NEW.status = 'completed' THEN
    notification_type := 'ride_completed';
    notification_title := 'Ride Completed';
    notification_message := 'Your ride from ' || NEW.origin || ' to ' || NEW.destination || ' has been completed. Please rate your experience!';
    
    -- Notify all confirmed passengers
    FOR passenger_record IN
      SELECT passenger_id FROM public.bookings 
      WHERE ride_id = NEW.id AND status = 'confirmed'
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        passenger_record.passenger_id,
        notification_type,
        notification_title,
        notification_message,
        jsonb_build_object(
          'ride_id', NEW.id,
          'driver_id', NEW.driver_id
        )
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for ride status change
DROP TRIGGER IF EXISTS on_ride_status_change ON public.rides;
CREATE TRIGGER on_ride_status_change
  AFTER UPDATE ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_ride_status_change();

-- Create function for new messages
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
  ride_id UUID;
  driver_id UUID;
  passenger_id UUID;
BEGIN
  -- Get booking info
  SELECT b.passenger_id, r.driver_id, b.ride_id
  INTO passenger_id, driver_id, ride_id
  FROM public.bookings b
  JOIN public.rides r ON r.id = b.ride_id
  WHERE b.id = NEW.booking_id;

  -- Determine recipient (opposite of sender)
  IF NEW.sender_id = driver_id THEN
    recipient_id := passenger_id;
  ELSE
    recipient_id := driver_id;
  END IF;

  -- Get sender name
  SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;

  -- Insert notification
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    recipient_id,
    'new_message',
    'New Message',
    COALESCE(sender_name, 'Someone') || ': ' || LEFT(NEW.content, 50) || CASE WHEN LENGTH(NEW.content) > 50 THEN '...' ELSE '' END,
    jsonb_build_object(
      'booking_id', NEW.booking_id,
      'message_id', NEW.id,
      'sender_id', NEW.sender_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

-- Create function for SOS alerts
CREATE OR REPLACE FUNCTION public.notify_sos_alert()
RETURNS TRIGGER AS $$
DECLARE
  contact_record RECORD;
  user_name TEXT;
BEGIN
  -- Get user name
  SELECT full_name INTO user_name FROM public.profiles WHERE id = NEW.user_id;

  -- Notify all admins
  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT 
    ur.user_id,
    'sos_alert',
    '🚨 SOS ALERT',
    COALESCE(user_name, 'A user') || ' has triggered an emergency alert! Location: ' || COALESCE(NEW.location_text, 'Unknown'),
    jsonb_build_object(
      'sos_id', NEW.id,
      'user_id', NEW.user_id,
      'latitude', NEW.latitude,
      'longitude', NEW.longitude,
      'ride_id', NEW.ride_id
    )
  FROM public.user_roles ur
  WHERE ur.role = 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for SOS alerts
DROP TRIGGER IF EXISTS on_sos_alert ON public.sos_alerts;
CREATE TRIGGER on_sos_alert
  AFTER INSERT ON public.sos_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_sos_alert();