/**
 * Doctor Controller — handles HTTP request/response for doctor endpoints.
 */
const doctorService = require('../services/doctor.service');
const { createAuditLog } = require('../services/audit.service');
const { sendSuccess } = require('../utils/apiResponse');
const { AUDIT_ACTIONS, AUDIT_RESULTS } = require('../utils/constants');

/**
 * POST /api/doctors — Register a new doctor (hospital admin)
 */
async function registerDoctor(req, res, next) {
  try {
    const { userId, hospitalId, licenseNumber, specialization } = req.body;

    const doctor = await doctorService.registerDoctor({
      userId,
      hospitalId,
      licenseNumber,
      specialization,
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.DOCTOR_REGISTERED,
      resourceType: 'doctor',
      resourceId: doctor.id,
      result: AUDIT_RESULTS.SUCCESS,
      metadata: { hospitalId, licenseNumber },
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Doctor registered successfully',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/doctors/me — Get current doctor's profile
 */
async function getMyProfile(req, res, next) {
  try {
    const doctor = await doctorService.getMyDoctorProfile(req.user.id);

    return sendSuccess(res, {
      message: 'Doctor profile retrieved',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/doctors/:id — Get a doctor by ID
 */
async function getDoctor(req, res, next) {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);

    return sendSuccess(res, {
      message: 'Doctor retrieved',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/doctors/hospital/:hospitalId — List doctors at a hospital
 */
async function listDoctorsByHospital(req, res, next) {
  try {
    const { page, limit, includeInactive } = req.query;

    const result = await doctorService.listDoctorsByHospital(
      req.params.hospitalId,
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        includeInactive: includeInactive === 'true',
      }
    );

    return sendSuccess(res, {
      message: 'Doctors retrieved',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/doctors/:id — Update doctor details
 */
async function updateDoctor(req, res, next) {
  try {
    const doctor = await doctorService.updateDoctor(
      req.params.id,
      req.user.id,
      req.body
    );

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'DOCTOR_UPDATED',
      resourceType: 'doctor',
      resourceId: doctor.id,
      result: AUDIT_RESULTS.SUCCESS,
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      message: 'Doctor updated',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/doctors/:id/verify — Verify a doctor (admin only)
 */
async function verifyDoctor(req, res, next) {
  try {
    const doctor = await doctorService.verifyDoctor(req.params.id);

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.DOCTOR_VERIFIED,
      resourceType: 'doctor',
      resourceId: doctor.id,
      result: AUDIT_RESULTS.SUCCESS,
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      message: 'Doctor verified',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/doctors/:id — Deactivate a doctor (hospital admin)
 */
async function deactivateDoctor(req, res, next) {
  try {
    const doctor = await doctorService.deactivateDoctor(req.params.id, req.user.id);

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'DOCTOR_DEACTIVATED',
      resourceType: 'doctor',
      resourceId: doctor.id,
      result: AUDIT_RESULTS.SUCCESS,
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      message: 'Doctor deactivated',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerDoctor,
  getMyProfile,
  getDoctor,
  listDoctorsByHospital,
  updateDoctor,
  verifyDoctor,
  deactivateDoctor,
};
