/**
 * Hospital Controller — handles HTTP request/response for hospital endpoints.
 */
const hospitalService = require('../services/hospital.service');
const { createAuditLog } = require('../services/audit.service');
const { sendSuccess } = require('../utils/apiResponse');
const { AUDIT_ACTIONS, AUDIT_RESULTS } = require('../utils/constants');

/**
 * POST /api/hospitals
 */
async function createHospital(req, res, next) {
  try {
    const { name, registrationNumber, address, city, state, phone, email } = req.body;

    const hospital = await hospitalService.createHospital({
      name,
      registrationNumber,
      address,
      city,
      state,
      phone,
      email,
      createdBy: req.user.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.HOSPITAL_REGISTERED,
      resourceType: 'hospital',
      resourceId: hospital.id,
      result: AUDIT_RESULTS.SUCCESS,
      metadata: { name, registrationNumber },
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Hospital registered successfully',
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/hospitals
 */
async function listHospitals(req, res, next) {
  try {
    const { page, limit, city, verified } = req.query;

    const result = await hospitalService.listHospitals({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      city,
      verified: verified !== undefined ? verified === 'true' : undefined,
    });

    return sendSuccess(res, {
      message: 'Hospitals retrieved',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/hospitals/my-hospital
 */
async function getMyHospital(req, res, next) {
  try {
    const result = await hospitalService.getMyHospital(req.user.id);

    return sendSuccess(res, {
      message: 'Hospital retrieved',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/hospitals/:id
 */
async function getHospital(req, res, next) {
  try {
    const hospital = await hospitalService.getHospitalById(req.params.id);

    return sendSuccess(res, {
      message: 'Hospital retrieved',
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/hospitals/:id
 */
async function updateHospital(req, res, next) {
  try {
    const hospital = await hospitalService.updateHospital(
      req.params.id,
      req.user.id,
      req.body
    );

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.HOSPITAL_UPDATED,
      resourceType: 'hospital',
      resourceId: hospital.id,
      result: AUDIT_RESULTS.SUCCESS,
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      message: 'Hospital updated',
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/hospitals/:id/staff
 */
async function addStaff(req, res, next) {
  try {
    const staff = await hospitalService.addStaff(
      req.params.id,
      req.user.id,
      req.body
    );

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.STAFF_ADDED,
      resourceType: 'hospital_staff',
      resourceId: staff.id,
      result: AUDIT_RESULTS.SUCCESS,
      metadata: { hospitalId: req.params.id, staffUserId: req.body.userId },
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Staff member added',
      data: staff,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/hospitals/:id/staff
 */
async function listStaff(req, res, next) {
  try {
    const staff = await hospitalService.listStaff(req.params.id, req.user.id);

    return sendSuccess(res, {
      message: 'Staff list retrieved',
      data: staff,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/hospitals/:id/staff/:staffId
 */
async function removeStaff(req, res, next) {
  try {
    const staff = await hospitalService.removeStaff(
      req.params.id,
      req.user.id,
      req.params.staffId
    );

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'STAFF_REMOVED',
      resourceType: 'hospital_staff',
      resourceId: staff.id,
      result: AUDIT_RESULTS.SUCCESS,
      metadata: { hospitalId: req.params.id },
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      message: 'Staff member deactivated',
      data: staff,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createHospital,
  listHospitals,
  getMyHospital,
  getHospital,
  updateHospital,
  addStaff,
  listStaff,
  removeStaff,
};
