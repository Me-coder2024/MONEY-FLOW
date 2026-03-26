-- =============================================================
-- MONEY HANDLER — Clear All Data Script
-- Run this in the Supabase SQL Editor to start fresh
-- =============================================================

-- This will delete all records from all tables and reset the auto-increment counters.
TRUNCATE TABLE 
  audit_log, 
  gst_bills, 
  withdrawals, 
  deposits, 
  founders, 
  funds, 
  workspace_members 
RESTART IDENTITY CASCADE;

-- Note: The CASCADE keyword ensures that dependent records are also deleted.
-- RESTART IDENTITY resets the ID counters (e.g., BIGSERIAL) back to 1.
