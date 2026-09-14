-- ============================================================
-- CRYPTO HEALTH — Fix: Grant table permissions to roles
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- 
-- ROOT CAUSE: The profiles and audit_logs tables were created
-- with RLS enabled and policies defined, but the base-level
-- table privileges (SELECT, INSERT, UPDATE, DELETE) were never
-- granted to the service_role or authenticated roles.
--
-- RLS policies only FILTER rows — the role still needs
-- GRANT-level access to the table itself.
-- ============================================================

-- Grant full access to service_role (used by backend via secret key)
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.audit_logs TO service_role;

-- Grant necessary access to authenticated users (used by RLS policies)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;

-- Grant access to anon role (for public-facing queries, if any)
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.audit_logs TO anon;
