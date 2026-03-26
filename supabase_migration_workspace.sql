-- ============================================
-- MIGRATION: Team Workspace System
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create workspace_members table
-- When user A adds founder B by email, B gets access to A's workspace
CREATE TABLE IF NOT EXISTS workspace_members (
  id SERIAL PRIMARY KEY,
  workspace_id TEXT NOT NULL,           -- Firebase UID of the workspace owner
  member_email TEXT NOT NULL,           -- Email of the invited member
  member_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'founder', -- owner, admin, founder, viewer
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, member_email)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_workspace_members_email ON workspace_members(member_email);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);

-- Disable RLS (we use Firebase auth, not Supabase auth)
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;
