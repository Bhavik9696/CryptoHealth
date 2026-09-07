/**
 * Doctor Service — handles all doctor-related operations.
 * Doctors are users with role 'doctor' linked to a hospital.
 */
const { supabaseAdmin } = require('../config/supabase');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../utils/errors');

/**
 * Register a doctor and link them to a hospital.
 * Called by a hospital_admin to add a doctor to their hospital.
 */
async function registerDoctor({ userId, hospitalId, licenseNumber, specialization }) {
  // Verify the target user exists and has role 'doctor'
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .single();

  if (!profile) {
    throw new NotFoundError('User not found');
  }

  if (profile.role !== 'doctor') {
    throw new BadRequestError('User must have the "doctor" role to be registered as a doctor');
  }

  // Check if doctor already registered at this hospital
  const { data: existing } = await supabaseAdmin
    .from('doctors')
    .select('id')
    .eq('user_id', userId)
    .eq('hospital_id', hospitalId)
    .single();

  if (existing) {
    throw new ConflictError('This doctor is already registered at this hospital');
  }

  // Check license number uniqueness
  const { data: licenseExists } = await supabaseAdmin
    .from('doctors')
    .select('id')
    .eq('license_number', licenseNumber)
    .single();

  if (licenseExists) {
    throw new ConflictError('A doctor with this license number already exists');
  }

  const { data: doctor, error } = await supabaseAdmin
    .from('doctors')
    .insert({
      user_id: userId,
      hospital_id: hospitalId,
      license_number: licenseNumber,
      specialization: specialization || null,
      is_verified: false,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Doctor registration error:', error);
    throw new BadRequestError('Failed to register doctor');
  }

  return doctor;
}

/**
 * Get the current doctor's profile (GET /doctors/me).
 */
async function getMyDoctorProfile(userId) {
  const { data: doctor, error } = await supabaseAdmin
    .from('doctors')
    .select(`
      id,
      license_number,
      specialization,
      is_verified,
      is_active,
      created_at,
      updated_at,
      hospitals:hospital_id (
        id,
        name,
        registration_number,
        city,
        state,
        is_verified
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error || !doctor) {
    throw new NotFoundError('Doctor profile not found. You may not be registered as a doctor yet.');
  }

  return doctor;
}

/**
 * Get doctor by ID (for internal use or admin).
 */
async function getDoctorById(doctorId) {
  const { data: doctor, error } = await supabaseAdmin
    .from('doctors')
    .select(`
      id,
      user_id,
      license_number,
      specialization,
      is_verified,
      is_active,
      created_at,
      updated_at,
      hospitals:hospital_id (
        id,
        name,
        registration_number,
        city,
        state
      ),
      profiles:user_id (
        id,
        full_name,
        phone,
        role
      )
    `)
    .eq('id', doctorId)
    .single();

  if (error || !doctor) {
    throw new NotFoundError('Doctor not found');
  }

  return doctor;
}

/**
 * List all doctors at a specific hospital.
 * Hospital admin can see all doctors; others see only verified+active.
 */
async function listDoctorsByHospital(hospitalId, { page = 1, limit = 20, includeInactive = false } = {}) {
  let query = supabaseAdmin
    .from('doctors')
    .select(`
      id,
      user_id,
      license_number,
      specialization,
      is_verified,
      is_active,
      created_at,
      profiles:user_id (
        id,
        full_name,
        phone
      )
    `, { count: 'exact' })
    .eq('hospital_id', hospitalId);

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new BadRequestError('Failed to fetch doctors');
  }

  return {
    doctors: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Update doctor details (specialization, license, etc.).
 */
async function updateDoctor(doctorId, requesterId, updates) {
  // Fetch the doctor to verify ownership or admin access
  const { data: doctor } = await supabaseAdmin
    .from('doctors')
    .select('id, user_id, hospital_id')
    .eq('id', doctorId)
    .single();

  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }

  // Only the doctor themselves or a hospital admin can update
  if (doctor.user_id !== requesterId) {
    // Check if requester is hospital admin
    const { data: staffRecord } = await supabaseAdmin
      .from('hospital_staff')
      .select('id, role')
      .eq('user_id', requesterId)
      .eq('hospital_id', doctor.hospital_id)
      .eq('role', 'admin')
      .eq('is_active', true)
      .single();

    if (!staffRecord) {
      throw new ForbiddenError('Only the doctor or the hospital admin can update this profile');
    }
  }

  const allowedFields = ['specialization', 'license_number'];
  const sanitized = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      sanitized[key] = updates[key];
    }
  }

  if (Object.keys(sanitized).length === 0) {
    throw new BadRequestError('No valid fields to update');
  }

  const { data: updated, error } = await supabaseAdmin
    .from('doctors')
    .update(sanitized)
    .eq('id', doctorId)
    .select()
    .single();

  if (error) {
    throw new BadRequestError('Failed to update doctor');
  }

  return updated;
}

/**
 * Verify a doctor (admin-only action).
 */
async function verifyDoctor(doctorId) {
  const { data: doctor, error } = await supabaseAdmin
    .from('doctors')
    .update({ is_verified: true })
    .eq('id', doctorId)
    .select()
    .single();

  if (error || !doctor) {
    throw new NotFoundError('Doctor not found');
  }

  return doctor;
}

/**
 * Deactivate a doctor (hospital admin removes them from hospital).
 */
async function deactivateDoctor(doctorId, adminUserId) {
  const { data: doctor } = await supabaseAdmin
    .from('doctors')
    .select('id, hospital_id')
    .eq('id', doctorId)
    .single();

  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }

  // Verify requester is hospital admin
  const { data: staffRecord } = await supabaseAdmin
    .from('hospital_staff')
    .select('id, role')
    .eq('user_id', adminUserId)
    .eq('hospital_id', doctor.hospital_id)
    .eq('role', 'admin')
    .eq('is_active', true)
    .single();

  if (!staffRecord) {
    throw new ForbiddenError('Only the hospital admin can deactivate a doctor');
  }

  const { data: updated, error } = await supabaseAdmin
    .from('doctors')
    .update({ is_active: false })
    .eq('id', doctorId)
    .select()
    .single();

  if (error) {
    throw new BadRequestError('Failed to deactivate doctor');
  }

  return updated;
}

/**
 * Get the doctor record for a given user_id (internal helper).
 * Used by other services to check if a user is a registered doctor.
 */
async function getDoctorByUserId(userId) {
  const { data: doctor } = await supabaseAdmin
    .from('doctors')
    .select('id, user_id, hospital_id, is_verified, is_active')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  return doctor; // may be null
}

module.exports = {
  registerDoctor,
  getMyDoctorProfile,
  getDoctorById,
  listDoctorsByHospital,
  updateDoctor,
  verifyDoctor,
  deactivateDoctor,
  getDoctorByUserId,
};
