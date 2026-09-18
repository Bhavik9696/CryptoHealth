const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { env } = require('../config/env');
const { encryptBuffer, decryptBuffer } = require('../crypto/envelopeEncryption');
const { signCanonicalPayload } = require('../crypto/signatures');
const { isPatientLinkedToHospital } = require('./patientLink.service');
const { createAuditLog } = require('./audit.service');
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../utils/errors');
const { AUDIT_ACTIONS, AUDIT_RESULTS } = require('../utils/constants');

function publicReport(report) {
  const {
    file_path: _filePath,
    encryption_metadata: _encryptionMetadata,
    encryption_iv: _encryptionIv,
    encryption_tag: _encryptionTag,
    encrypted_dek: _encryptedDek,
    ...safeReport
  } = report;
  return safeReport;
}

function decryptHospitalPrivateKey(value) {
  try {
    const envelope = JSON.parse(value);
    return decryptBuffer(
      Buffer.from(envelope.ciphertext, 'base64'),
      envelope.metadata,
      env.MASTER_ENCRYPTION_KEY
    ).toString('base64');
  } catch {
    // Existing Phase 2 rows used raw base64. New rows are always encrypted.
    return value;
  }
}

async function getHospitalForUploader(userId, role) {
  if (role === 'hospital_admin') {
    const { data } = await supabaseAdmin
      .from('hospital_staff')
      .select('hospital_id, hospitals(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    return data;
  }

  const { data } = await supabaseAdmin
    .from('doctors')
    .select('hospital_id, hospitals(*)')
    .eq('user_id', userId)
    .single();
  return data;
}

async function assertReportAccess(report, user) {
  if (!user) throw new ForbiddenError('Authentication required');
  if (user.role === 'admin') return;
  if (user.role === 'patient' && report.patient_id === user.id) return;

  const hospital = await getHospitalForUploader(user.id, user.role);
  if (hospital && report.hospital_id === hospital.hospital_id) return;
  throw new ForbiddenError('You do not have permission to access this report');
}

async function uploadReport({ file, patientId, reportType, title, description, user, ipAddress }) {
  if (!env.MASTER_ENCRYPTION_KEY) {
    throw new Error('MASTER_ENCRYPTION_KEY is not configured');
  }

  const hospitalRecord = await getHospitalForUploader(user.id, user.role);
  if (!hospitalRecord || !hospitalRecord.hospital_id || !hospitalRecord.hospitals) {
    throw new ForbiddenError('Uploader is not an active member of a hospital');
  }

  const hospital = hospitalRecord.hospitals;
  if (!hospital.signing_private_key_encrypted) {
    throw new Error('Hospital signing key is not configured');
  }
  if (!(await isPatientLinkedToHospital(patientId, hospital.id))) {
    throw new ForbiddenError('Patient is not linked to this hospital');
  }

  const reportId = crypto.randomUUID();
  const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const encrypted = encryptBuffer(file.buffer, env.MASTER_ENCRYPTION_KEY);
  const signedPayload = {
    report_id: reportId,
    patient_id: patientId,
    hospital_id: hospital.id,
    report_type: reportType,
    file_name: file.originalname,
    file_size: file.size,
    mime_type: file.mimetype,
    file_hash: fileHash,
  };
  const signed = signCanonicalPayload(
    signedPayload,
    decryptHospitalPrivateKey(hospital.signing_private_key_encrypted)
  );
  const storagePath = `${patientId}/${reportId}/encrypted.bin`;

  const { error: storageError } = await supabaseAdmin.storage
    .from(env.STORAGE_BUCKET)
    .upload(storagePath, encrypted.ciphertext, {
      contentType: 'application/octet-stream',
      upsert: false,
    });
  if (storageError) throw new BadRequestError('Failed to store encrypted medical report');

  const row = {
    id: reportId,
    patient_id: patientId,
    hospital_id: hospital.id,
    uploaded_by: user.id,
    report_type: reportType,
    title: title || file.originalname,
    description: description || null,
    file_path: storagePath,
    file_name: file.originalname,
    file_size: file.size,
    mime_type: file.mimetype,
    file_hash: fileHash,
    encryption_metadata: encrypted.metadata,
    encryption_iv: encrypted.metadata.iv,
    encryption_tag: encrypted.metadata.auth_tag,
    encrypted_dek: encrypted.metadata.encrypted_dek,
    signature: signed.signature,
    signed_payload_hash: signed.payloadHash,
    signing_hospital_id: hospital.id,
    status: 'PENDING',
  };

  const { data: report, error: insertError } = await supabaseAdmin
    .from('medical_reports')
    .insert(row)
    .select()
    .single();
  if (insertError) {
    await supabaseAdmin.storage.from(env.STORAGE_BUCKET).remove([storagePath]);
    throw new BadRequestError('Failed to save medical report metadata');
  }

  await createAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: AUDIT_ACTIONS.REPORT_UPLOADED,
    resourceType: 'medical_report',
    resourceId: report.id,
    result: AUDIT_RESULTS.SUCCESS,
    metadata: { file_hash: fileHash, patient_id: patientId },
    ipAddress,
  });
  return publicReport(report);
}

async function listReports({ user, patientId, hospitalId, page = 1, limit = 20 }) {
  let query = supabaseAdmin
    .from('medical_reports')
    .select('id, patient_id, hospital_id, report_type, title, description, file_name, file_size, mime_type, signature, signed_payload_hash, status, uploaded_at, verified_at', { count: 'exact' });
  if (user.role === 'patient') query = query.eq('patient_id', user.id);
  else if (user.role === 'hospital_admin' || user.role === 'doctor') {
    const hospital = await getHospitalForUploader(user.id, user.role);
    if (!hospital) throw new ForbiddenError('Hospital membership not found');
    query = query.eq('hospital_id', hospital.hospital_id);
  } else if (user.role === 'admin') {
    if (patientId) query = query.eq('patient_id', patientId);
    if (hospitalId) query = query.eq('hospital_id', hospitalId);
  } else throw new ForbiddenError('Role is not allowed to list reports');

  const offset = (page - 1) * limit;
  const { data, error, count } = await query.order('uploaded_at', { ascending: false }).range(offset, offset + limit - 1);
  if (error) throw new BadRequestError('Failed to fetch reports');
  return { reports: data || [], pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } };
}

async function getReport(reportId, user) {
  const { data, error } = await supabaseAdmin.from('medical_reports').select('*').eq('id', reportId).single();
  if (error || !data) throw new NotFoundError('Medical report not found');
  await assertReportAccess(data, user);
  return data;
}

async function downloadReport(reportId, user, ipAddress) {
  const report = await getReport(reportId, user);
  const { data, error } = await supabaseAdmin.storage.from(env.STORAGE_BUCKET).download(report.file_path);
  if (error || !data) throw new NotFoundError('Encrypted medical report file not found');
  const ciphertext = Buffer.from(await data.arrayBuffer());
  let plaintext;
  try {
    plaintext = decryptBuffer(ciphertext, report.encryption_metadata, env.MASTER_ENCRYPTION_KEY);
  } catch {
    await createAuditLog({ actorId: user.id, actorRole: user.role, action: AUDIT_ACTIONS.SIGNATURE_FAILED, resourceType: 'medical_report', resourceId: reportId, result: AUDIT_RESULTS.FAILURE, ipAddress });
    throw new Error('Medical report integrity verification failed');
  }
  const actualHash = crypto.createHash('sha256').update(plaintext).digest('hex');
  if (actualHash !== report.file_hash) throw new Error('Medical report hash verification failed');
  await createAuditLog({ actorId: user.id, actorRole: user.role, action: AUDIT_ACTIONS.REPORT_DOWNLOADED, resourceType: 'medical_report', resourceId: reportId, result: AUDIT_RESULTS.SUCCESS, ipAddress });
  return { report, plaintext };
}

async function deleteReport(reportId, user, ipAddress) {
  const report = await getReport(reportId, user);
  if (user.role !== 'patient' || report.patient_id !== user.id) throw new ForbiddenError('Only the patient can delete this report');
  const { error } = await supabaseAdmin.from('medical_reports').update({ status: 'DELETED' }).eq('id', reportId);
  if (error) throw new BadRequestError('Failed to delete medical report');
  await createAuditLog({ actorId: user.id, actorRole: user.role, action: AUDIT_ACTIONS.REPORT_DELETED, resourceType: 'medical_report', resourceId: reportId, result: AUDIT_RESULTS.SUCCESS, ipAddress });
}

module.exports = { uploadReport, listReports, getReport, downloadReport, deleteReport };