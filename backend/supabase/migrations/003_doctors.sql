-- ============================================================
-- CRYPTO HEALTH — Phase 3: Doctors
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Doctors table (links a user with 'doctor' role to a hospital)
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL,
  specialization TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, hospital_id)
);

-- Indexes
CREATE INDEX idx_doctors_user ON doctors(user_id);
CREATE INDEX idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX idx_doctors_verified ON doctors(is_verified);
CREATE INDEX idx_doctors_active ON doctors(is_active);
CREATE UNIQUE INDEX idx_doctors_license ON doctors(license_number);

-- 2. Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for doctors
-- Doctors can view their own record
CREATE POLICY "Doctors can view own record"
  ON doctors FOR SELECT
  USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access on doctors"
  ON doctors FOR ALL
  USING (auth.role() = 'service_role');

-- 4. Auto-update trigger
CREATE TRIGGER doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DONE! Phase 3 doctors table is ready.
-- ============================================================
