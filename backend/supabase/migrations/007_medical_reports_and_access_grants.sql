-- ============================================================
-- CRYPTO HEALTH — Phase 5 + 6: Medical Reports + Access Grants
-- 
-- PURPOSE:
--   This migration creates the two tables missing from the
--   existing Supabase database:
--     - medical_reports
--     - access_grants
--
-- SAFE TO RUN ON EXISTING DATABASE:
--   - Uses CREATE TABLE IF NOT EXISTS — no error if already exists
--   - Uses CREATE INDEX IF NOT EXISTS
--   - Uses DROP POLICY IF EXISTS before CREATE POLICY — idempotent
--   - Does NOT drop or alter any existing tables
--   - Does NOT touch profiles / hospitals / doctors / hospital_staff / patient_links / audit_logs
--
-- PREREQUISITE: The following migrations must already be applied:
--   001_profiles_and_audit.sql     ← profiles, audit_logs tables
--   002_hospitals_and_staff.sql    ← hospitals, hospital_staff tables
--   003_doctors.sql                ← doctors table
--   004_patient_links.sql          ← patient_links table
--
-- IMPORTANT ARCHITECTURE NOTE:
--   medical_reports.patient_id → profiles.id  (NOT a separate "patients" table)
--   access_grants.patient_id   → profiles.id
--   The backend identifies patients directly by their profile ID.
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================


-- ============================================================
-- TABLE 1: medical_reports
-- ============================================================
CREATE TABLE IF NOT EXISTS public.medical_reports (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who the report belongs to (patient's profile ID)
  patient_id            UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Which hospital created/owns this report
  hospital_id           UUID        NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,

  -- Which hospital staff member uploaded it
  uploaded_by           UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Report metadata
  report_type           TEXT        NOT NULL,
  title                 TEXT,
  description           TEXT,
  file_name             TEXT        NOT NULL,
  file_size             BIGINT,
  mime_type             TEXT,

  -- Storage path (Supabase Storage) — stores the ENCRYPTED binary
  file_path             TEXT        NOT NULL,

  -- Integrity — SHA-256 hash of the ORIGINAL plaintext file
  file_hash             TEXT        NOT NULL,

  -- Encryption — envelope encryption fields
  -- encryption_metadata: full JSONB metadata (algorithm, version, iv, tag, encrypted_dek, etc.)
  encryption_metadata   JSONB,
  -- Individual fields mirrored from encryption_metadata for easier querying
  encryption_iv         TEXT,         -- AES-256-GCM nonce (base64)
  encryption_tag        TEXT,         -- GCM authentication tag (base64)
  encrypted_dek         TEXT,         -- Wrapped data-encryption key (base64) — NEVER a plaintext key

  -- Digital Signature — Ed25519
  signature             TEXT,         -- Base64 Ed25519 signature of canonical payload hash
  signed_payload_hash   TEXT,         -- Base64 SHA-256 hash of the canonical signed payload
  signing_hospital_id   UUID        REFERENCES public.hospitals(id) ON DELETE SET NULL,

  -- Status lifecycle: PENDING → VERIFIED | INVALID | REVOKED | DELETED
  status                TEXT        NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'VERIFIED', 'INVALID', 'REVOKED', 'DELETED')),

  -- Timestamps
  uploaded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at           TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_medical_reports_patient_id
  ON public.medical_reports(patient_id);

CREATE INDEX IF NOT EXISTS idx_medical_reports_hospital_id
  ON public.medical_reports(hospital_id);

CREATE INDEX IF NOT EXISTS idx_medical_reports_uploaded_by
  ON public.medical_reports(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_medical_reports_status
  ON public.medical_reports(status);

CREATE INDEX IF NOT EXISTS idx_medical_reports_status_uploaded
  ON public.medical_reports(status, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_medical_reports_signing_hospital
  ON public.medical_reports(signing_hospital_id);

-- Auto-update trigger (reuses the function from 001_profiles_and_audit.sql)
DROP TRIGGER IF EXISTS medical_reports_updated_at ON public.medical_reports;
CREATE TRIGGER medical_reports_updated_at
  BEFORE UPDATE ON public.medical_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Patients can view their own reports
DROP POLICY IF EXISTS "Patients can view own reports" ON public.medical_reports;
CREATE POLICY "Patients can view own reports"
  ON public.medical_reports FOR SELECT
  USING (auth.uid() = patient_id);

-- Service role gets full access (used by backend via secret key)
DROP POLICY IF EXISTS "Service role full access on medical_reports" ON public.medical_reports;
CREATE POLICY "Service role full access on medical_reports"
  ON public.medical_reports FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Table comments
COMMENT ON TABLE public.medical_reports IS
  'Encrypted medical report metadata. File bytes are stored encrypted in Supabase Storage.';
COMMENT ON COLUMN public.medical_reports.encrypted_dek IS
  'Base64 AES-256-GCM wrapped data-encryption key. Never stores a plaintext key.';
COMMENT ON COLUMN public.medical_reports.file_path IS
  'Path in Supabase Storage bucket. The file at this path is always encrypted.';
COMMENT ON COLUMN public.medical_reports.patient_id IS
  'References profiles.id directly. There is no separate patients table.';


-- ============================================================
-- TABLE 2: access_grants
-- ============================================================
CREATE TABLE IF NOT EXISTS public.access_grants (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The patient who created this grant
  patient_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Which report is being shared
  report_id           UUID        NOT NULL REFERENCES public.medical_reports(id) ON DELETE CASCADE,

  -- Optional: a specific known doctor recipient
  recipient_id        UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_role      TEXT        NOT NULL DEFAULT 'doctor',

  -- What the recipient is allowed to do
  scope               TEXT        NOT NULL DEFAULT 'view'
                      CHECK (scope IN ('view', 'download')),

  -- SECURITY: Only the SHA-256 hash of the raw token is stored.
  -- The raw token is returned once to the patient and never stored.
  access_token_hash   TEXT        NOT NULL UNIQUE,

  -- Optional use-count limiting
  max_uses            INT,                          -- NULL = unlimited within expiry
  use_count           INT         NOT NULL DEFAULT 0,

  -- Expiry
  expires_at          TIMESTAMPTZ NOT NULL,

  -- Status lifecycle
  status              TEXT        NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'revoked', 'expired', 'used')),
  revoked_at          TIMESTAMPTZ,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_access_grants_patient_id
  ON public.access_grants(patient_id);

CREATE INDEX IF NOT EXISTS idx_access_grants_report_id
  ON public.access_grants(report_id);

CREATE INDEX IF NOT EXISTS idx_access_grants_token_hash
  ON public.access_grants(access_token_hash);

CREATE INDEX IF NOT EXISTS idx_access_grants_status
  ON public.access_grants(status);

CREATE INDEX IF NOT EXISTS idx_access_grants_expires_at
  ON public.access_grants(expires_at);

-- Enable Row Level Security
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Patients can view their own grants
DROP POLICY IF EXISTS "Patients can view own access grants" ON public.access_grants;
CREATE POLICY "Patients can view own access grants"
  ON public.access_grants FOR SELECT
  USING (auth.uid() = patient_id);

-- Service role gets full access
DROP POLICY IF EXISTS "Service role full access on access_grants" ON public.access_grants;
CREATE POLICY "Service role full access on access_grants"
  ON public.access_grants FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Table comment
COMMENT ON TABLE public.access_grants IS
  'Patient-issued access grants. Only SHA-256 token hashes are stored, never raw tokens.';
COMMENT ON COLUMN public.access_grants.access_token_hash IS
  'SHA-256 hex hash of the raw access token. Raw token is returned to patient once and never stored.';


-- ============================================================
-- GRANTS (table-level permissions)
-- ============================================================
GRANT ALL ON public.medical_reports TO service_role;
GRANT ALL ON public.access_grants TO service_role;
GRANT SELECT ON public.medical_reports TO authenticated;
GRANT SELECT ON public.access_grants TO authenticated;


-- ============================================================
-- DONE!
-- medical_reports and access_grants tables are ready.
-- ============================================================
