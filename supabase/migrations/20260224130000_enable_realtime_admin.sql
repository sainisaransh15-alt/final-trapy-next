-- Enable Realtime for admin panel tables
-- This allows the admin panel to receive real-time updates when data changes

-- Enable realtime for rides table
ALTER PUBLICATION supabase_realtime ADD TABLE rides;

-- Enable realtime for bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Enable realtime for sos_alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Enable realtime for verification_documents table
ALTER PUBLICATION supabase_realtime ADD TABLE verification_documents;
