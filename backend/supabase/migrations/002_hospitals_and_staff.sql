-- ============================================================
-- CRYPTO HEALTH — Phase 2: Hospitals + Hospital Staff
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  signing_public_key TEXT,
  signing_private_key_encrypted TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_hospitals_name ON hospitals(name);
CREATE INDEX idx_hospitals_city ON hospitals(city);
CREATE INDEX idx_hospitals_verified ON hospitals(is_verified);
CREATE UNIQUE INDEX idx_hospitals_reg_number ON hospitals(registration_number);

-- 2. Hospital staff table (links users to hospitals with roles)
CREATE TYPE hospital_staff_role AS ENUM ('admin', 'staff', 'lab_tech');

CREATE TABLE IF NOT EXISTS hospital_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  role hospital_staff_role NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, hospital_id)
);

-- Indexes
CREATE INDEX idx_hospital_staff_user ON hospital_staff(user_id);
CREATE INDEX idx_hospital_staff_hospital ON hospital_staff(hospital_id);
CREATE INDEX idx_hospital_staff_active ON hospital_staff(is_active);

-- 3. Enable Row Level Security
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_staff ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for hospitals
-- Anyone authenticated can view verified hospitals
CREATE POLICY "Authenticated users can view verified hospitals"
  ON hospitals FOR SELECT
  USING (is_verified = TRUE);

-- Service role full access
CREATE POLICY "Service role full access on hospitals"
  ON hospitals FOR ALL
  USING (auth.role() = 'service_role');

-- 5. RLS Policies for hospital_staff
-- Staff can view their own record
CREATE POLICY "Staff can view own record"
  ON hospital_staff FOR SELECT
  USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access on hospital_staff"
  ON hospital_staff FOR ALL
  USING (auth.role() = 'service_role');

-- 6. Auto-update trigger for hospitals
CREATE TRIGGER hospitals_updated_at
  BEFORE UPDATE ON hospitals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update trigger for hospital_staff
CREATE TRIGGER hospital_staff_updated_at
  BEFORE UPDATE ON hospital_staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DONE! Phase 2 tables are ready.
-- ============================================================
