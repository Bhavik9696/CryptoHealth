-- ============================================================
-- CRYPTO HEALTH — Phase 6: Access Grants & Secure Tokens
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- 
-- The access grant system is the core sharing mechanism of CryptoHealth.
-- A patient issues a cryptographically random token tied to a specific
-- report with a defined scope (view/download), expiry, and optional
-- max-use limit. The raw token is NEVER stored — only its SHA-256 hash.
-- ============================================================

CREATE TABLE IF NOT EXISTS access_grants (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_id         UUID        NOT NULL REFERENCES medical_reports(id) ON DELETE CASCADE,
  recipient_id      UUID        REFERENCES profiles(id) ON DELETE SET NULL,    -- Known doctor (optional)
  recipient_role    TEXT        NOT NULL DEFAULT 'doctor',
  scope             TEXT        NOT NULL DEFAULT 'view'
                    CHECK (scope IN ('view', 'download')),
  access_token_hash TEXT        NOT NULL UNIQUE,                                -- SHA-256 of raw token
  max_uses          INT,                                                         -- NULL = unlimited within expiry
  use_count         INT         NOT NULL DEFAULT 0,
  expires_at        TIMESTAMPTZ NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'revoked', 'expired', 'used')),
  revoked_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for frequent query patterns
CREATE INDEX idx_access_grants_patient    ON access_grants(patient_id);
CREATE INDEX idx_access_grants_report     ON access_grants(report_id);
CREATE INDEX idx_access_grants_status     ON access_grants(status);
CREATE INDEX idx_access_grants_expires    ON access_grants(expires_at);
CREATE INDEX idx_access_grants_token_hash ON access_grants(access_token_hash);

-- Enable Row Level Security
ALTER TABLE access_grants ENABLE ROW LEVEL SECURITY;

-- Patients can view their own grants
CREATE POLICY "Patients can view own access grants"
  ON access_grants FOR SELECT
  USING (auth.uid() = patient_id);

-- Service role gets full access (used by our Node backend)
CREATE POLICY "Service role full access on access_grants"
  ON access_grants FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- DONE! Phase 6 access_grants table is ready.
-- ============================================================
