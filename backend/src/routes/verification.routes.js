/**
 * Runtime report verification endpoint.
 * Verifies issuer signature over canonical metadata and the decrypted file hash.
 * It returns verification facts only; it never returns report contents.
 */
const express = require('express');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { env } = require('../config/env');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../utils/constants');
const reportService = require('../services/report.service');
const { sensitiveLimiter } = require('../middleware/rateLimiter');
const { decryptBuffer } = require('../crypto/envelopeEncryption');
const { hashPayload, verifySignature } = require('../crypto/signatures');
const { createAuditLog } = require('../services/audit.service');

const router = express.Router();

async function verifyReport(req, res, next) {
  try {
    const { reportId } = req.params;
    // Reuse normal record-level access policy before running the verification scan.
    await reportService.getReport(reportId, req.user);
    const { data: report, error } = await supabaseAdmin
      .from('medical_reports')
      .select('id, patient_id, hospital_id, signing_hospital_id, report_type, title, file_name, file_size, mime_type, file_path, file_hash, encryption_metadata, signature, signed_payload_hash, status, uploaded_at, verified_at, uploaded_by')
      .eq('id', reportId)
      .maybeSingle();

    if (error) {
      const failure = new Error('Unable to retrieve report for verification');
      failure.statusCode = 502;
      throw failure;
    }
    if (!report) {
      return res.status(404).json({ success: false, message: 'Medical report not found' });
    }

    const signingHospitalId = report.signing_hospital_id || report.hospital_id;
    const { data: hospital } = await supabaseAdmin
      .from('hospitals')
      .select('id, name, signing_public_key')
      .eq('id', signingHospitalId)
      .maybeSingle();

    const signedPayload = {
      report_id: report.id,
      patient_id: report.patient_id,
      hospital_id: signingHospitalId,
      report_type: report.report_type,
      file_name: report.file_name,
      file_size: Number(report.file_size),
      mime_type: report.mime_type,
      file_hash: report.file_hash,
    };
    const recomputedPayloadHash = hashPayload(signedPayload).toString('base64');
    const canonicalPayloadMatches = !!report.signed_payload_hash &&
      recomputedPayloadHash === report.signed_payload_hash;
    const signatureValid = !!(
      canonicalPayloadMatches &&
      report.signature &&
      hospital?.signing_public_key &&
      verifySignature(report.signature, report.signed_payload_hash, hospital.signing_public_key)
    );

    let hashValid = false;
    if (env.MASTER_ENCRYPTION_KEY && report.file_path && report.encryption_metadata) {
      try {
        const { data: encryptedFile, error: downloadError } = await supabaseAdmin.storage
          .from(env.STORAGE_BUCKET)
          .download(report.file_path);
        if (!downloadError && encryptedFile) {
          const ciphertext = Buffer.from(await encryptedFile.arrayBuffer());
          const plaintext = decryptBuffer(ciphertext, report.encryption_metadata, env.MASTER_ENCRYPTION_KEY);
          const actualHash = crypto.createHash('sha256').update(plaintext).digest('hex');
          hashValid = actualHash === report.file_hash;
        }
      } catch {
        hashValid = false;
      }
    }

    const authentic = signatureValid && hashValid;
    if (report.status !== 'DELETED' && report.status !== 'REVOKED') {
      await supabaseAdmin.from('medical_reports').update({
        status: authentic ? 'VERIFIED' : 'INVALID',
        verified_at: authentic ? new Date().toISOString() : null,
      }).eq('id', report.id);
    }

    if (req.user) {
      await createAuditLog({
        actorId: req.user.id,
        actorRole: req.user.role,
        action: authentic ? 'SIGNATURE_VERIFIED' : 'SIGNATURE_FAILED',
        resourceType: 'medical_report',
        resourceId: report.id,
        result: authentic ? 'success' : 'failure',
        metadata: { signature_valid: signatureValid, hash_valid: hashValid },
        ipAddress: req.ip,
      });
    }

    return res.json({
      success: true,
      message: 'Report verification completed',
      data: {
        report_id: report.id,
        status: authentic ? 'VERIFIED' : 'INVALID',
        signature_valid: signatureValid,
        hash_valid: hashValid,
        hospital: hospital?.name || 'Unknown issuer',
        doctor: 'Not recorded',
        verified_at: new Date().toISOString(),
        message: authentic
          ? 'The issuer signature is valid and the stored file matches its signed integrity hash.'
          : 'Verification failed. The report signature, encryption, issuer key, or file integrity check did not pass.',
      },
    });
  } catch (error) {
    next(error);
  }
}

router.get('/reports/:reportId', authenticate, authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.ADMIN), sensitiveLimiter, verifyReport);
router.post('/reports/:reportId', authenticate, authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.ADMIN), sensitiveLimiter, verifyReport);

module.exports = router;
