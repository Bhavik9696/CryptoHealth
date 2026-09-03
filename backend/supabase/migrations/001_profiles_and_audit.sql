-- ============================================================
-- CRYPTO HEALTH — Phase 1: Profiles + Audit Logs
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create custom types (enums)
CREATE TYPE user_role AS ENUM ('patient', 'hospital_admin', 'doctor', 'admin');
CREATE TYPE audit_result AS ENUM ('success', 'failure', 'denied');

-- 2. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- 3. Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  actor_role TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  result audit_result NOT NULL DEFAULT 'success',
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- 4. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role can do everything (our backend uses service/secret key)
CREATE POLICY "Service role full access on profiles"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');

-- 6. RLS Policies for audit_logs
-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = actor_id);

-- Service role can do everything
CREATE POLICY "Service role full access on audit_logs"
  ON audit_logs FOR ALL
  USING (auth.role() = 'service_role');

-- 7. Auto-update updated_at trigger for profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DONE! Phase 1 tables are ready.
-- ============================================================
