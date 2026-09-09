/**
 * Hospital Service — handles all hospital and staff operations.
 */
const { supabaseAdmin } = require('../config/supabase');
const { generateSigningKeyPair } = require('../crypto/signatures');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../utils/errors');

/**
 * Register a new hospital.
 * Generates an Ed25519 signing keypair for report signing.
 */
async function createHospital({ name, registrationNumber, address, city, state, phone, email, createdBy }) {
  // Check if registration number already exists
  const { data: existing } = await supabaseAdmin
    .from('hospitals')
    .select('id')
    .eq('registration_number', registrationNumber)
    .single();

  if (existing) {
    throw new ConflictError('A hospital with this registration number already exists');
  }

  // Generate Ed25519 signing keypair
  const { publicKey, privateKey } = generateSigningKeyPair();

  const { data: hospital, error } = await supabaseAdmin
    .from('hospitals')
    .insert({
      name,
      registration_number: registrationNumber,
      address,
      city,
      state,
      phone,
      email,
      signing_public_key: publicKey,
      signing_private_key_encrypted: privateKey, // MVP: stored as base64; production: encrypt with KMS
      is_verified: false,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) {
    console.error('Hospital creation error:', error);
    throw new BadRequestError('Failed to register hospital');
  }

  // Auto-add the creator as hospital admin staff
  await supabaseAdmin.from('hospital_staff').insert({
    user_id: createdBy,
    hospital_id: hospital.id,
    role: 'admin',
    is_active: true,
  });

  // Return hospital without the private key
  const { signing_private_key_encrypted, ...safeHospital } = hospital;
  return safeHospital;
}

/**
 * List all hospitals (with optional filters).
 */
async function listHospitals({ page = 1, limit = 20, city, verified } = {}) {
  let query = supabaseAdmin
    .from('hospitals')
    .select('id, name, registration_number, address, city, state, phone, email, signing_public_key, is_verified, created_at', { count: 'exact' });

  if (city) {
    query = query.ilike('city', `%${city}%`);
  }

  if (verified !== undefined) {
    query = query.eq('is_verified', verified);
  }

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new BadRequestError('Failed to fetch hospitals');
  }

  return {
    hospitals: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Get a single hospital by ID.
 */
async function getHospitalById(hospitalId) {
  const { data: hospital, error } = await supabaseAdmin
    .from('hospitals')
    .select('id, name, registration_number, address, city, state, phone, email, signing_public_key, is_verified, created_at, updated_at')
    .eq('id', hospitalId)
    .single();

  if (error || !hospital) {
    throw new NotFoundError('Hospital not found');
  }

  return hospital;
}

/**
 * Update hospital details. Only hospital admin staff can update.
 */
async function updateHospital(hospitalId, userId, updates) {
  // Verify user is admin staff of this hospital
  await verifyHospitalAdmin(userId, hospitalId);

  const allowedFields = ['name', 'address', 'city', 'state', 'phone', 'email'];
  const sanitized = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      sanitized[key] = updates[key];
    }
  }

  if (Object.keys(sanitized).length === 0) {
    throw new BadRequestError('No valid fields to update');
  }

  const { data: hospital, error } = await supabaseAdmin
    .from('hospitals')
    .update(sanitized)
    .eq('id', hospitalId)
    .select('id, name, registration_number, address, city, state, phone, email, signing_public_key, is_verified, created_at, updated_at')
    .single();

  if (error) {
    throw new BadRequestError('Failed to update hospital');
  }

  return hospital;
}

/**
 * Add a staff member to a hospital.
 */
async function addStaff(hospitalId, adminUserId, { userId, role }) {
  // Verify the requester is admin of this hospital
  await verifyHospitalAdmin(adminUserId, hospitalId);

  // Check target user exists and has hospital_admin role
  const { data: targetProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .single();

  if (!targetProfile) {
    throw new NotFoundError('User not found');
  }

  if (targetProfile.role !== 'hospital_admin') {
    throw new BadRequestError('User must have hospital_admin role to be added as hospital staff');
  }

  // Check if already a staff member
  const { data: existingStaff } = await supabaseAdmin
    .from('hospital_staff')
    .select('id')
    .eq('user_id', userId)
    .eq('hospital_id', hospitalId)
    .single();

  if (existingStaff) {
    throw new ConflictError('User is already a staff member of this hospital');
  }

  const { data: staff, error } = await supabaseAdmin
    .from('hospital_staff')
    .insert({
      user_id: userId,
      hospital_id: hospitalId,
      role: role || 'staff',
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Add staff error:', error);
    throw new BadRequestError('Failed to add staff member');
  }

  return staff;
}

/**
 * List all staff members of a hospital.
 */
async function listStaff(hospitalId, adminUserId) {
  // Verify the requester is admin of this hospital
  await verifyHospitalAdmin(adminUserId, hospitalId);

  const { data: staff, error } = await supabaseAdmin
    .from('hospital_staff')
    .select(`
      id,
      role,
      is_active,
      created_at,
      user_id,
      profiles:user_id (
        id,
        full_name,
        phone,
        role
      )
    `)
    .eq('hospital_id', hospitalId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('List staff error:', error);
    throw new BadRequestError('Failed to fetch staff');
  }

  return staff;
}

/**
 * Remove a staff member from a hospital (soft-delete: set is_active = false).
 */
async function removeStaff(hospitalId, adminUserId, staffId) {
  await verifyHospitalAdmin(adminUserId, hospitalId);

  const { data, error } = await supabaseAdmin
    .from('hospital_staff')
    .update({ is_active: false })
    .eq('id', staffId)
    .eq('hospital_id', hospitalId)
    .select()
    .single();

  if (error || !data) {
    throw new NotFoundError('Staff member not found');
  }

  return data;
}

/**
 * Get the hospital that a user belongs to as staff.
 */
async function getMyHospital(userId) {
  const { data: staffRecord, error } = await supabaseAdmin
    .from('hospital_staff')
    .select(`
      id,
      role,
      is_active,
      hospitals:hospital_id (
        id,
        name,
        registration_number,
        address,
        city,
        state,
        phone,
        email,
        signing_public_key,
        is_verified,
        created_at
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error || !staffRecord) {
    throw new NotFoundError('You are not associated with any hospital');
  }

  return {
    staffRole: staffRecord.role,
    hospital: staffRecord.hospitals,
  };
}

// --- Helper Functions ---

/**
 * Verify that a user is an active admin staff member of the given hospital.
 */
async function verifyHospitalAdmin(userId, hospitalId) {
  const { data: staffRecord, error } = await supabaseAdmin
    .from('hospital_staff')
    .select('id, role, is_active')
    .eq('user_id', userId)
    .eq('hospital_id', hospitalId)
    .single();

  if (error || !staffRecord) {
    throw new ForbiddenError('You are not a staff member of this hospital');
  }

  if (!staffRecord.is_active) {
    throw new ForbiddenError('Your staff access has been deactivated');
  }

  if (staffRecord.role !== 'admin') {
    throw new ForbiddenError('Only hospital admins can perform this action');
  }

  return staffRecord;
}

/**
 * Verify that a user is any active staff member of the given hospital.
 */
async function verifyHospitalStaff(userId, hospitalId) {
  const { data: staffRecord, error } = await supabaseAdmin
    .from('hospital_staff')
    .select('id, role, is_active')
    .eq('user_id', userId)
    .eq('hospital_id', hospitalId)
    .single();

  if (error || !staffRecord) {
    throw new ForbiddenError('You are not a staff member of this hospital');
  }

  if (!staffRecord.is_active) {
    throw new ForbiddenError('Your staff access has been deactivated');
  }

  return staffRecord;
}

module.exports = {
  createHospital,
  listHospitals,
  getHospitalById,
  updateHospital,
  addStaff,
  listStaff,
  removeStaff,
  getMyHospital,
  verifyHospitalAdmin,
  verifyHospitalStaff,
};
