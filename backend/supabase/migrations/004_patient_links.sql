-- ============================================================
-- CRYPTO HEALTH — Phase 4: Patient Linking
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Patient links table
-- Allows patients to generate short-lived codes that hospitals/doctors
-- use to link the patient into their system for report uploads.
CREATE TABLE IF NOT EXISTS patient_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  linking_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_by_hospital_id UUID REFERENCES hospitals(id),
  used_by_doctor_id UUID REFERENCES doctors(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_patient_links_code ON patient_links(linking_code) WHERE used = FALSE;
CREATE INDEX idx_patient_links_patient ON patient_links(patient_id);
CREATE INDEX idx_patient_links_expires ON patient_links(expires_at);
CREATE INDEX idx_patient_links_hospital ON patient_links(used_by_hospital_id);

-- 2. Enable Row Level Security
ALTER TABLE patient_links ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Patients can view their own links
CREATE POLICY "Patients can view own links"
  ON patient_links FOR SELECT
  USING (auth.uid() = patient_id);

-- Service role full access
CREATE POLICY "Service role full access on patient_links"
  ON patient_links FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- DONE! Phase 4 patient_links table is ready.
-- ============================================================
