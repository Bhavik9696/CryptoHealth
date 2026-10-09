/**
 * Compatibility routes for the React portal's /api/sharing API.
 * The access_grants service remains the source of truth for tokens,
 * expiry, revocation, and use limits.
 */
const express = require('express');
const Joi = require('joi');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { env } = require('../config/env');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { sensitiveLimiter } = require('../middleware/rateLimiter');
const { ROLES, AUDIT_ACTIONS, AUDIT_RESULTS } = require('../utils/constants');
const { BadRequestError, ForbiddenError, NotFoundError } = require('../utils/errors');
const { decryptBuffer } = require('../crypto/envelopeEncryption');
const { createAuditLog } = require('../services/audit.service');
const accessGrantService = require('../services/accessGrant.service');

const router = express.Router();
const patientOnly = [authenticate, authorize(ROLES.PATIENT)];
const providerOnly = [authenticate, authorize(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN)];

function publicShare(grant, actor, accessToken) {
  const status = String(grant.status || 'active').toLowerCase();
  const report = grant.medical_reports || {};
  return {
    id: grant.id,
    report_id: grant.report_id,
    report_type: report.report_type || report.title || 'Medical report',
    patient_id: grant.patient_id || actor.id,
    patient_name: actor.full_name || undefined,
    created_by: grant.patient_id || actor.id,
    recipient_id: grant.recipient_id || undefined,
    expires_at: grant.expires_at,
    status: status === 'revoked' ? 'REVOKED' : (status === 'expired' || status === 'used' ? 'EXPIRED' : 'ACTIVE'),
    can_view: true,
    can_download: grant.scope === 'download',
    ...(accessToken ? { access_token: accessToken } : {}),
    created_at: grant.created_at,
  };
}

router.get('/', ...patientOnly, async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const status = req.query.status ? String(req.query.status).toLowerCase() : undefined;
    const result = await accessGrantService.listGrants(req.user.id, { page, limit, status });
    const data = result.grants.map((grant) => publicShare(grant, req.user));
    const pagination = result.pagination;
    return res.json({
      success: true, message: 'Temporary shares retrieved', data,
      total: pagination.total || 0, page, limit, totalPages: pagination.totalPages || 0,
    });
  } catch (error) { return next(error); }
});

router.post('/', ...patientOnly, async (req, res, next) => {
  try {
    const schema = Joi.object({
      report_id: Joi.string().uuid().required(),
      recipient_id: Joi.string().uuid().optional(),
      duration_minutes: Joi.number().integer().min(1).max(10080).required(),
      can_view: Joi.boolean().default(true),
      can_download: Joi.boolean().default(false),
    });
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) throw new BadRequestError(error.details.map((item) => item.message).join('; '));
    if (!value.can_view && !value.can_download) throw new BadRequestError('Enable view or download permission.');

    const { grant, rawToken } = await accessGrantService.createGrant({
      patientId: req.user.id,
      reportId: value.report_id,
      recipientId: value.recipient_id || null,
      scope: value.can_download ? 'download' : 'view',
      expiresInMinutes: value.duration_minutes,
      ipAddress: req.ip,
    });

    const { data: report } = await supabaseAdmin
      .from('medical_reports')
      .select('report_type, title')
      .eq('id', grant.report_id)
      .maybeSingle();

    return res.status(201).json({
      success: true,
      message: 'Temporary access created. The raw token is shown only once.',
      data: publicShare({ ...grant, medical_reports: report }, req.user, rawToken),
    });
  } catch (error) { return next(error); }
});

router.get('/:shareId', ...patientOnly, async (req, res, next) => {
  try {
    const grant = await accessGrantService.getGrant(req.params.shareId, req.user.id);
    const { data: report } = await supabaseAdmin
      .from('medical_reports')
      .select('report_type, title')
      .eq('id', grant.report_id)
      .maybeSingle();
    return res.json({ success: true, data: publicShare({ ...grant, medical_reports: report }, req.user) });
  } catch (error) { return next(error); }
});

router.post('/:shareId/revoke', ...patientOnly, async (req, res, next) => {
  try {
    const grant = await accessGrantService.revokeGrant(req.params.shareId, req.user.id, req.ip);
    return res.json({ success: true, message: 'Temporary access revoked', data: publicShare(grant, req.user) });
  } catch (error) { return next(error); }
});

// The share landing page previews only safe report metadata. It does not consume
// a one-time token; the streaming endpoint below validates and consumes it.
router.post('/validate', sensitiveLimiter, ...providerOnly, async (req, res, next) => {
  try {
    const schema = Joi.object({ token: Joi.string().pattern(/^[0-9a-f]{96}$/i).required() });
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) throw new BadRequestError('Provide a valid 96-character access token.');
    const result = await accessGrantService.validateToken(value.token, req.user.id, req.ip, {
      consume: false, actorRole: req.user.role,
    });
    return res.json({
      success: true,
      data: {
        grant: result.grant,
        report: {
          id: result.report.id,
          report_type: result.report.report_type,
          title: result.report.title,
          file_name: result.report.file_name,
          file_size: result.report.file_size,
          mime_type: result.report.mime_type,
          status: result.report.status,
          uploaded_at: result.report.uploaded_at,
        },
      },
    });
  } catch (error) { return next(error); }
});

router.get('/:token/file', sensitiveLimiter, ...providerOnly, async (req, res, next) => {
  try {
    const result = await accessGrantService.validateToken(req.params.token, req.user.id, req.ip, {
      consume: true, actorRole: req.user.role,
    });
    const reportId = result.report?.id;
    if (!reportId) throw new NotFoundError('Shared report not found');

    const { data: report, error: reportError } = await supabaseAdmin
      .from('medical_reports')
      .select('id, file_path, file_name, file_size, mime_type, file_hash, encryption_metadata, status')
      .eq('id', reportId)
      .maybeSingle();
    if (reportError || !report || report.status === 'DELETED' || report.status === 'REVOKED') {
      throw new NotFoundError('Shared report is no longer available');
    }
    if (!env.MASTER_ENCRYPTION_KEY) throw new Error('Report decryption is not configured');

    const { data: encryptedFile, error: storageError } = await supabaseAdmin.storage
      .from(env.STORAGE_BUCKET)
      .download(report.file_path);
    if (storageError || !encryptedFile) throw new NotFoundError('Encrypted report file not found');

    const ciphertext = Buffer.from(await encryptedFile.arrayBuffer());
    const plaintext = decryptBuffer(ciphertext, report.encryption_metadata, env.MASTER_ENCRYPTION_KEY);
    const actualHash = crypto.createHash('sha256').update(plaintext).digest('hex');
    if (actualHash !== report.file_hash) throw new Error('Report integrity check failed');

    const isDownload = result.grant.scope === 'download';
    const fileName = String(report.file_name || 'medical-report').replace(/[\r\n"]/g, '_');
    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: isDownload ? AUDIT_ACTIONS.REPORT_DOWNLOADED : AUDIT_ACTIONS.REPORT_VIEWED,
      resourceType: 'medical_report',
      resourceId: report.id,
      result: AUDIT_RESULTS.SUCCESS,
      metadata: { access_grant_id: result.grant.id, via_temporary_share: true },
      ipAddress: req.ip,
    });
    res.set('Content-Type', report.mime_type || 'application/octet-stream');
    res.set('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${fileName}"`);
    res.set('Cache-Control', 'private, no-store');
    return res.send(plaintext);
  } catch (error) { return next(error); }
});

module.exports = router;
