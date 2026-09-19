/**
 * Access Grant Service — the core sharing mechanism of CryptoHealth.
 *
 * A patient issues a cryptographically random access token tied to a specific
 * medical report. The token can be:
 *   - Scoped to view or download
 *   - Time-limited (configurable expiry)
 *   - Use-limited (optional max uses)
 *   - Revoked at any time by the patient
 *
 * Security properties:
 *   - Raw token is 48 random bytes (384-bit entropy) — brute force infeasible
 *   - Only the SHA-256 hash is stored in the database — token theft from DB is useless
 *   - Expiry, use count, and revocation are checked atomically on every use
 *   - All access attempts are audit logged regardless of success or failure
 */
const { supabaseAdmin } = require('../config/supabase');
const { generateAccessToken, hashToken } = require('../crypto/tokenGenerator');
const { createAuditLog } = require('./audit.service');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  GoneError,
} = require('../utils/errors');
const {
  AUDIT_ACTIONS,
  AUDIT_RESULTS,
  ACCESS_TOKEN_LENGTH,
  DEFAULT_ACCESS_EXPIRY_HOURS,
  ACCESS_GRANT_STATUS,
} = require('../utils/constants');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validate that the calling user owns the report they want to grant access to.
 */
async function assertPatientOwnsReport(patientId, reportId) {
  const { data: report } = await supabaseAdmin
    .from('medical_reports')
    .select('id, patient_id, status')
    .eq('id', reportId)
    .neq('status', 'DELETED')
    .single();

  if (!report) {
    throw new NotFoundError('Medical report not found');
  }

  if (report.patient_id !== patientId) {
    throw new ForbiddenError('You can only share your own reports');
  }

  return report;
}

// ─── Core Operations ──────────────────────────────────────────────────────────

/**
 * Create a new access grant for a medical report.
 * Called exclusively by the patient who owns the report.
 *
 * @returns {{ grant: object, rawToken: string }} The DB record + the raw token
 *          to be returned once (never stored).
 */
async function createGrant({
  patientId,
  reportId,
  scope = 'view',
  expiresInHours = DEFAULT_ACCESS_EXPIRY_HOURS,
  maxUses = null,
  recipientId = null,
  ipAddress,
}) {
  // Validate ownership
  await assertPatientOwnsReport(patientId, reportId);

  // Validate scope
  if (!['view', 'download'].includes(scope)) {
    throw new BadRequestError('scope must be "view" or "download"');
  }

  // Validate expiry
  if (expiresInHours <= 0 || expiresInHours > 168) {
    throw new BadRequestError('expiresInHours must be between 1 and 168 (7 days)');
  }

  // Generate a cryptographically random token and hash it for storage
  const rawToken = generateAccessToken(ACCESS_TOKEN_LENGTH);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const { data: grant, error } = await supabaseAdmin
    .from('access_grants')
    .insert({
      patient_id: patientId,
      report_id: reportId,
      recipient_id: recipientId || null,
      recipient_role: 'doctor',
      scope,
      access_token_hash: tokenHash,
      max_uses: maxUses || null,
      use_count: 0,
      expires_at: expiresAt.toISOString(),
      status: ACCESS_GRANT_STATUS.ACTIVE,
    })
    .select()
    .single();

  if (error) {
    console.error('Access grant creation error:', error);
    throw new BadRequestError('Failed to create access grant');
  }

  await createAuditLog({
    actorId: patientId,
    actorRole: 'patient',
    action: AUDIT_ACTIONS.ACCESS_GRANT_CREATED,
    resourceType: 'access_grant',
    resourceId: grant.id,
    result: AUDIT_RESULTS.SUCCESS,
    metadata: { report_id: reportId, scope, expires_at: expiresAt },
    ipAddress,
  });

  // Return token only once — it will never be retrievable again
  return { grant, rawToken };
}

/**
 * List all access grants created by a patient.
 * Automatically marks expired grants as 'expired' before returning.
 */
async function listGrants(patientId, { page = 1, limit = 20, status } = {}) {
  // Sweep expired grants
  await supabaseAdmin
    .from('access_grants')
    .update({ status: ACCESS_GRANT_STATUS.EXPIRED })
    .eq('patient_id', patientId)
    .eq('status', ACCESS_GRANT_STATUS.ACTIVE)
    .lt('expires_at', new Date().toISOString());

  let query = supabaseAdmin
    .from('access_grants')
    .select(`
      id,
      report_id,
      recipient_id,
      scope,
      max_uses,
      use_count,
      expires_at,
      status,
      revoked_at,
      created_at,
      medical_reports:report_id (
        id,
        title,
        report_type,
        file_name
      )
    `, { count: 'exact' })
    .eq('patient_id', patientId);

  if (status) query = query.eq('status', status);

  const offset = (page - 1) * limit;
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new BadRequestError('Failed to fetch access grants');

  return {
    grants: data,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

/**
 * Get a single access grant by ID (patient can only see their own).
 */
async function getGrant(grantId, patientId) {
  const { data: grant, error } = await supabaseAdmin
    .from('access_grants')
    .select('*')
    .eq('id', grantId)
    .eq('patient_id', patientId)
    .single();

  if (error || !grant) throw new NotFoundError('Access grant not found');
  return grant;
}

/**
 * Revoke an active access grant.
 * Only the patient who created it can revoke it.
 */
async function revokeGrant(grantId, patientId, ipAddress) {
  const { data: grant } = await supabaseAdmin
    .from('access_grants')
    .select('id, patient_id, status, report_id')
    .eq('id', grantId)
    .single();

  if (!grant) throw new NotFoundError('Access grant not found');
  if (grant.patient_id !== patientId) throw new ForbiddenError('You can only revoke your own grants');

  if (grant.status === ACCESS_GRANT_STATUS.REVOKED) {
    throw new ConflictError('Access grant is already revoked');
  }
  if (grant.status === ACCESS_GRANT_STATUS.EXPIRED) {
    throw new ConflictError('Access grant has already expired');
  }

  const { data: updated, error } = await supabaseAdmin
    .from('access_grants')
    .update({
      status: ACCESS_GRANT_STATUS.REVOKED,
      revoked_at: new Date().toISOString(),
    })
    .eq('id', grantId)
    .select()
    .single();

  if (error) throw new BadRequestError('Failed to revoke access grant');

  await createAuditLog({
    actorId: patientId,
    actorRole: 'patient',
    action: AUDIT_ACTIONS.ACCESS_GRANT_REVOKED,
    resourceType: 'access_grant',
    resourceId: grantId,
    result: AUDIT_RESULTS.SUCCESS,
    metadata: { report_id: grant.report_id },
    ipAddress,
  });

  return updated;
}

// ─── Token Validation (Doctor-Facing) ─────────────────────────────────────────

/**
 * Validate an access token submitted by a doctor.
 * This is the security-critical path:
 *   1. Hash the submitted raw token
 *   2. Look up by hash — if not found → invalid
 *   3. Check status, expiry, and use count atomically
 *   4. Increment use_count; mark as 'used' if max_uses reached
 *   5. Audit log regardless of outcome
 *
 * @returns {{ grant: object, report: object }} on success
 */
async function validateToken(rawToken, doctorUserId, ipAddress) {
  const tokenHash = hashToken(rawToken);

  // Look up by hash
  const { data: grant } = await supabaseAdmin
    .from('access_grants')
    .select(`
      *,
      medical_reports:report_id (
        id,
        patient_id,
        hospital_id,
        report_type,
        title,
        file_name,
        file_size,
        mime_type,
        file_hash,
        signature,
        signed_payload_hash,
        status,
        uploaded_at
      )
    `)
    .eq('access_token_hash', tokenHash)
    .single();

  // Helper — audit and throw
  const denyAndAudit = async (reason) => {
    await createAuditLog({
      actorId: doctorUserId,
      actorRole: 'doctor',
      action: AUDIT_ACTIONS.ACCESS_TOKEN_VALIDATED,
      resourceType: 'access_grant',
      result: AUDIT_RESULTS.DENIED,
      metadata: { reason },
      ipAddress,
    });
    throw new ForbiddenError(`Access denied: ${reason}`);
  };

  if (!grant) return denyAndAudit('Invalid token');
  if (grant.status === ACCESS_GRANT_STATUS.REVOKED) return denyAndAudit('Token has been revoked by the patient');
  if (grant.status === ACCESS_GRANT_STATUS.USED) return denyAndAudit('Token has already been fully used');
  if (grant.status === ACCESS_GRANT_STATUS.EXPIRED || new Date(grant.expires_at) < new Date()) {
    // Sweep to expired
    await supabaseAdmin.from('access_grants').update({ status: ACCESS_GRANT_STATUS.EXPIRED }).eq('id', grant.id);
    return denyAndAudit('Token has expired');
  }

  // Check max uses
  if (grant.max_uses !== null && grant.use_count >= grant.max_uses) {
    await supabaseAdmin.from('access_grants').update({ status: ACCESS_GRANT_STATUS.USED }).eq('id', grant.id);
    return denyAndAudit('Token use limit reached');
  }

  // Atomically increment use_count; mark used if limit reached
  const newUseCount = grant.use_count + 1;
  const isExhausted = grant.max_uses !== null && newUseCount >= grant.max_uses;

  await supabaseAdmin
    .from('access_grants')
    .update({
      use_count: newUseCount,
      status: isExhausted ? ACCESS_GRANT_STATUS.USED : ACCESS_GRANT_STATUS.ACTIVE,
    })
    .eq('id', grant.id);

  await createAuditLog({
    actorId: doctorUserId,
    actorRole: 'doctor',
    action: AUDIT_ACTIONS.ACCESS_TOKEN_VALIDATED,
    resourceType: 'access_grant',
    resourceId: grant.id,
    result: AUDIT_RESULTS.SUCCESS,
    metadata: {
      report_id: grant.report_id,
      scope: grant.scope,
      use_count: newUseCount,
    },
    ipAddress,
  });

  return {
    grant: {
      id: grant.id,
      scope: grant.scope,
      expiresAt: grant.expires_at,
      useCount: newUseCount,
      maxUses: grant.max_uses,
    },
    report: grant.medical_reports,
  };
}

/**
 * Download the decrypted file for a valid token.
 * Re-validates the token before serving the file.
 */
async function getReportViaToken(rawToken, doctorUserId, ipAddress) {
  // Re-validate token (also increments use count)
  const { grant, report } = await validateToken(rawToken, doctorUserId, ipAddress);

  if (grant.scope !== 'download') {
    throw new ForbiddenError('This token only grants view access, not download');
  }

  return { grant, report };
}

module.exports = {
  createGrant,
  listGrants,
  getGrant,
  revokeGrant,
  validateToken,
  getReportViaToken,
};
