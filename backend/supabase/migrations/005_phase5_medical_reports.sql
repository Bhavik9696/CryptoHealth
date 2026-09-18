-- CryptoHealth Phase 5: encrypted medical reports
-- This migration is additive so it can be applied after the repository's
-- existing initial_schema migration without destroying existing report data.

ALTER TABLE public.medical_reports
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS encryption_iv TEXT,
  ADD COLUMN IF NOT EXISTS encryption_tag TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_dek TEXT,
  ADD COLUMN IF NOT EXISTS signed_payload_hash TEXT,
  ADD COLUMN IF NOT EXISTS signing_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_medical_reports_uploaded_by
  ON public.medical_reports(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_medical_reports_status_created
  ON public.medical_reports(status, uploaded_at DESC);

ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on medical_reports" ON public.medical_reports;
CREATE POLICY "Service role full access on medical_reports"
  ON public.medical_reports FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.medical_reports IS
  'Medical report metadata. File bytes are encrypted before being written to Supabase Storage.';
COMMENT ON COLUMN public.medical_reports.encrypted_dek IS
  'Base64-encoded AES-256-GCM wrapped data-encryption key; never a plaintext key.';