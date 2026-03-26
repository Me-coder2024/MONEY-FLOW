-- ============================================
-- MIGRATION: Add user_id for multi-tenancy
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Clear all existing seed/demo data
DELETE FROM audit_log;
DELETE FROM gst_bills;
DELETE FROM withdrawals;
DELETE FROM deposits;
DELETE FROM founders;
DELETE FROM funds;

-- 2. Add user_id column to all tables
ALTER TABLE funds ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE founders ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE deposits ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE gst_bills ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT '';

-- 3. Create indexes for fast user-based queries
CREATE INDEX IF NOT EXISTS idx_funds_user_id ON funds(user_id);
CREATE INDEX IF NOT EXISTS idx_founders_user_id ON founders(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

-- 4. Disable RLS (we filter by user_id in app since we use Firebase auth, not Supabase auth)
ALTER TABLE funds DISABLE ROW LEVEL SECURITY;
ALTER TABLE founders DISABLE ROW LEVEL SECURITY;
ALTER TABLE deposits DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE gst_bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
