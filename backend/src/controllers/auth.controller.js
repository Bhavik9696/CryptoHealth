/**
 * Auth Controller — handles HTTP request/response for auth endpoints.
 * Delegates business logic to auth.service.js.
 */
const authService = require('../services/auth.service');
const { createAuditLog } = require('../services/audit.service');
const { sendSuccess } = require('../utils/apiResponse');
const { AUDIT_ACTIONS, AUDIT_RESULTS } = require('../utils/constants');

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, password, fullName, phone, role } = req.body;

    const result = await authService.register({
      email,
      password,
      fullName,
      phone,
      role,
    });

    // Audit log
    await createAuditLog({
      actorId: result.user.id,
      actorRole: role,
      action: AUDIT_ACTIONS.USER_REGISTERED,
      resourceType: 'user',
      resourceId: result.user.id,
      result: AUDIT_RESULTS.SUCCESS,
      metadata: { email },
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: {
        user: result.user,
        session: result.session,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    // Audit log
    await createAuditLog({
      actorId: result.user.id,
      actorRole: result.user.role,
      action: AUDIT_ACTIONS.USER_LOGIN,
      resourceType: 'user',
      resourceId: result.user.id,
      result: AUDIT_RESULTS.SUCCESS,
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      message: 'Login successful',
      data: {
        user: result.user,
        session: result.session,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    const result = await authService.logout(req.token);

    // Audit log
    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.USER_LOGOUT,
      resourceType: 'user',
      resourceId: req.user.id,
      result: AUDIT_RESULTS.SUCCESS,
      ipAddress: req.ip,
    });

    return sendSuccess(res, { message: result.message });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    const profile = await authService.getProfile(req.user.id);

    return sendSuccess(res, {
      message: 'Profile retrieved',
      data: {
        id: req.user.id,
        email: req.user.email,
        ...profile,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/profile
 */
async function updateProfile(req, res, next) {
  try {
    const profile = await authService.updateProfile(req.user.id, req.body);

    // Audit log
    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.PROFILE_UPDATED,
      resourceType: 'user',
      resourceId: req.user.id,
      result: AUDIT_RESULTS.SUCCESS,
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      message: 'Profile updated',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
};
