-- =====================================================
-- TRAPY: Search Performance Indexes
-- Created: 2026-02-23
-- Purpose: Optimize ride search queries
-- =====================================================

-- Enable trigram extension for fuzzy text search
-- This allows partial matching like ILIKE '%Mumbai%'
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- RIDES TABLE INDEXES
-- =====================================================

-- Index for origin search (fuzzy text matching)
-- Used when: searching "from Mumbai"
CREATE INDEX IF NOT EXISTS idx_rides_origin_trgm 
ON rides USING gin (origin gin_trgm_ops);

-- Index for destination search (fuzzy text matching)
-- Used when: searching "to Pune"
CREATE INDEX IF NOT EXISTS idx_rides_destination_trgm 
ON rides USING gin (destination gin_trgm_ops);

-- Index for departure time (date range queries)
-- Used when: filtering by specific date
CREATE INDEX IF NOT EXISTS idx_rides_departure_time 
ON rides (departure_time);

-- Index for ride status
-- Used when: filtering active rides only
CREATE INDEX IF NOT EXISTS idx_rides_status 
ON rides (status) WHERE status = 'active';

-- Index for seats available
-- Used when: filtering rides with enough seats
CREATE INDEX IF NOT EXISTS idx_rides_seats_available 
ON rides (seats_available) WHERE seats_available > 0;

-- Composite index for common search pattern
-- Optimizes: status='active' AND departure_time >= X AND seats_available >= Y
CREATE INDEX IF NOT EXISTS idx_rides_active_search 
ON rides (status, departure_time, seats_available) 
WHERE status = 'active';

-- Index for driver lookup
-- Used when: joining rides with profiles
CREATE INDEX IF NOT EXISTS idx_rides_driver_id 
ON rides (driver_id);

-- Index for women-only filter
-- Used when: filtering women-only rides
CREATE INDEX IF NOT EXISTS idx_rides_women_only 
ON rides (is_women_only) WHERE is_women_only = true;

-- =====================================================
-- BOOKINGS TABLE INDEXES
-- =====================================================

-- Index for passenger's bookings
-- Used when: showing user's booking history
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_id 
ON bookings (passenger_id);

-- Index for ride's bookings
-- Used when: showing all bookings for a ride
CREATE INDEX IF NOT EXISTS idx_bookings_ride_id 
ON bookings (ride_id);

-- Index for booking status
-- Used when: filtering pending/confirmed bookings
CREATE INDEX IF NOT EXISTS idx_bookings_status 
ON bookings (status);

-- Composite index for driver's pending bookings
-- Used when: driver views pending booking requests
CREATE INDEX IF NOT EXISTS idx_bookings_pending 
ON bookings (status, created_at) 
WHERE status = 'pending';

-- =====================================================
-- PROFILES TABLE INDEXES
-- =====================================================

-- Index for referral code lookup
-- Used when: applying referral codes
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code 
ON profiles (referral_code) WHERE referral_code IS NOT NULL;

-- Index for phone number lookup
-- Used when: verifying phone numbers
CREATE INDEX IF NOT EXISTS idx_profiles_phone 
ON profiles (phone) WHERE phone IS NOT NULL;

-- =====================================================
-- NOTIFICATIONS TABLE INDEXES (only if table exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    -- Index for user's notifications
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id, created_at DESC)';
    -- Index for unread notifications
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id) WHERE is_read = false';
  END IF;
END
$$;

-- =====================================================
-- REVIEWS TABLE INDEXES (only if table exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews (reviewee_id)';
  END IF;
END
$$;

-- =====================================================
-- ANALYZE TABLES
-- Update statistics for query planner
-- =====================================================

ANALYZE rides;
ANALYZE bookings;
ANALYZE profiles;

-- Only analyze notifications if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    EXECUTE 'ANALYZE notifications';
  END IF;
END
$$;

-- =====================================================
-- DONE!
-- These indexes will significantly improve:
-- 1. Ride search performance
-- 2. Booking lookup speed
-- 3. Dashboard loading times
-- 4. Notification fetching
-- =====================================================
