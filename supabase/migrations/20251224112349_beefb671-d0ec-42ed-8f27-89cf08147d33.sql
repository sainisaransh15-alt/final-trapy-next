-- Add server-side content validation for messages and reviews
-- This prevents excessively long content and empty messages

-- Validation function for message content
CREATE OR REPLACE FUNCTION public.validate_message_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Check message length (max 1000 characters)
  IF LENGTH(NEW.content) > 1000 THEN
    RAISE EXCEPTION 'Message too long (max 1000 characters)';
  END IF;
  
  -- Check for empty/whitespace-only messages
  IF TRIM(NEW.content) = '' THEN
    RAISE EXCEPTION 'Message cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for message validation
CREATE TRIGGER validate_message_before_insert
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_message_content();

-- Validation function for review content
CREATE OR REPLACE FUNCTION public.validate_review_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Check review length if provided (max 500 characters)
  IF NEW.review IS NOT NULL THEN
    IF LENGTH(NEW.review) > 500 THEN
      RAISE EXCEPTION 'Review too long (max 500 characters)';
    END IF;
    
    -- Check for whitespace-only reviews
    IF TRIM(NEW.review) = '' THEN
      NEW.review := NULL;  -- Convert empty reviews to null
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for review validation
CREATE TRIGGER validate_review_before_insert
  BEFORE INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_review_content();