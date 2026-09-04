/**
 * Auth Service — handles all authentication and profile operations
 * via Supabase Auth and the profiles table.
 */
const { supabase, supabaseAdmin } = require('../config/supabase');
const { ROLES } = require('../utils/constants');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require('../utils/errors');

/**
 * Register a new user with Supabase Auth and create a profile.
 */
async function register({ email, password, fullName, phone, role }) {
  // Validate role
  const validRoles = [ROLES.PATIENT, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR];
  if (!validRoles.includes(role)) {
    throw new BadRequestError(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw new ConflictError('A user with this email already exists');
    }
    throw new BadRequestError(authError.message);
  }

  if (!authData.user) {
    throw new BadRequestError('Registration failed');
  }

  // Create profile using admin client (bypasses RLS)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      role,
      full_name: fullName,
      phone: phone || null,
    })
    .select()
    .single();

  if (profileError) {
    console.error('Profile creation error:', profileError);
    // Clean up: attempt to delete the auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw new BadRequestError('Failed to create user profile');
  }

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email,
      ...profile,
    },
    session: authData.session,
  };
}

/**
 * Login a user with email and password.
 */
async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    throw new NotFoundError('User profile not found');
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      ...profile,
    },
    session: data.session,
  };
}

/**
 * Logout — invalidate the current session.
 */
async function logout(token) {
  // Set the session for this specific token before signing out
  const { error } = await supabase.auth.signOut({ scope: 'local' });

  if (error) {
    console.warn('Logout warning:', error.message);
  }

  return { message: 'Logged out successfully' };
}

/**
 * Get the current user's profile.
 */
async function getProfile(userId) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    throw new NotFoundError('Profile not found');
  }

  return profile;
}

/**
 * Update the current user's profile.
 */
async function updateProfile(userId, updates) {
  const allowedFields = ['full_name', 'phone', 'avatar_url'];
  const sanitized = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      sanitized[key] = updates[key];
    }
  }

  if (Object.keys(sanitized).length === 0) {
    throw new BadRequestError('No valid fields to update');
  }

  sanitized.updated_at = new Date().toISOString();

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .update(sanitized)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new BadRequestError('Failed to update profile');
  }

  return profile;
}

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
};
