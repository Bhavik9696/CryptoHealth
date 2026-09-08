/**
 * Patient Link Service — handles patient linking code operations.
 *
 * Flow:
 * 1. Patient generates a short-lived linking code (8 chars, 5 min expiry)
 * 2. Hospital/doctor enters the code to link the patient
 * 3. Code is marked as used — one-time use only
 * 4. Once linked, the hospital can upload reports for this patient
 */
const { supabaseAdmin } = require('../config/supabase');
const { generateLinkingCode } = require('../crypto/tokenGenerator');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../utils/errors');
const {
  LINKING_CODE_LENGTH,
  LINKING_CODE_EXPIRY_MINUTES,
} = require('../utils/constants');

/**
 * Generate a new patient linking code.
 * Called by a patient who wants to share their identity with a hospital.
 */
async function generateCode(patientId) {
  // Invalidate any existing unused codes for this patient
  await supabaseAdmin
    .from('patient_links')
    .update({ used: true })
    .eq('patient_id', patientId)
    .eq('used', false);

  // Generate a new code
  const code = generateLinkingCode(LINKING_CODE_LENGTH);
  const expiresAt = new Date(Date.now() + LINKING_CODE_EXPIRY_MINUTES * 60 * 1000);

  const { data: link, error } = await supabaseAdmin
    .from('patient_links')
    .insert({
      patient_id: patientId,
      linking_code: code,
      expires_at: expiresAt.toISOString(),
      used: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Linking code generation error:', error);
    throw new BadRequestError('Failed to generate linking code');
  }

  return {
    code: link.linking_code,
    expiresAt: link.expires_at,
    expiresInMinutes: LINKING_CODE_EXPIRY_MINUTES,
  };
}

/**
 * Resolve (use) a patient linking code.
 * Called by a hospital admin/doctor when a patient shares their code.
 * Returns the patient profile for confirmation.
 */
async function resolveCode({ code, hospitalId, doctorId = null }) {
  // Look up the code
  const { data: link, error } = await supabaseAdmin
    .from('patient_links')
    .select(`
      id,
      patient_id,
      linking_code,
      expires_at,
      used,
      profiles:patient_id (
        id,
        full_name,
        phone,
        role
      )
    `)
    .eq('linking_code', code.toUpperCase())
    .single();

  if (error || !link) {
    throw new NotFoundError('Invalid linking code');
  }

  // Check if already used
  if (link.used) {
    throw new ConflictError('This linking code has already been used');
  }

  // Check expiration
  if (new Date(link.expires_at) < new Date()) {
    // Mark as used (expired)
    await supabaseAdmin
      .from('patient_links')
      .update({ used: true })
      .eq('id', link.id);

    throw new BadRequestError('This linking code has expired. Ask the patient to generate a new one.');
  }

  // Mark the code as used
  const { data: updatedLink, error: updateError } = await supabaseAdmin
    .from('patient_links')
    .update({
      used: true,
      used_by_hospital_id: hospitalId,
      used_by_doctor_id: doctorId,
      used_at: new Date().toISOString(),
    })
    .eq('id', link.id)
    .eq('used', false) // Optimistic lock — prevents race conditions
    .select()
    .single();

  if (updateError || !updatedLink) {
    throw new ConflictError('This linking code has already been used (concurrent use detected)');
  }

  return {
    linkId: updatedLink.id,
    patientId: link.patient_id,
    patient: link.profiles,
    hospitalId,
    doctorId,
    linkedAt: updatedLink.used_at,
  };
}

/**
 * Get linking history for a patient.
 */
async function getPatientLinkHistory(patientId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('patient_links')
    .select(`
      id,
      linking_code,
      expires_at,
      used,
      used_at,
      created_at,
      hospitals:used_by_hospital_id (
        id,
        name,
        city
      )
    `, { count: 'exact' })
    .eq('patient_id', patientId)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) {
    throw new BadRequestError('Failed to fetch link history');
  }

  return {
    links: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Get all patients linked to a specific hospital.
 */
async function getLinkedPatients(hospitalId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('patient_links')
    .select(`
      id,
      patient_id,
      used_at,
      profiles:patient_id (
        id,
        full_name,
        phone
      )
    `, { count: 'exact' })
    .eq('used_by_hospital_id', hospitalId)
    .eq('used', true)
    .range(offset, offset + limit - 1)
    .order('used_at', { ascending: false });

  if (error) {
    throw new BadRequestError('Failed to fetch linked patients');
  }

  // Deduplicate patients (a patient may have linked multiple times)
  const seenPatients = new Set();
  const uniquePatients = data.filter((link) => {
    if (seenPatients.has(link.patient_id)) return false;
    seenPatients.add(link.patient_id);
    return true;
  });

  return {
    patients: uniquePatients,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Check if a patient is linked to a specific hospital.
 * Used internally before allowing report uploads.
 */
async function isPatientLinkedToHospital(patientId, hospitalId) {
  const { data } = await supabaseAdmin
    .from('patient_links')
    .select('id')
    .eq('patient_id', patientId)
    .eq('used_by_hospital_id', hospitalId)
    .eq('used', true)
    .limit(1)
    .single();

  return !!data;
}

module.exports = {
  generateCode,
  resolveCode,
  getPatientLinkHistory,
  getLinkedPatients,
  isPatientLinkedToHospital,
};
