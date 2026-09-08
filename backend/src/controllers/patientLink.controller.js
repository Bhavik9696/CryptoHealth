/**
 * Patient Link Controller — handles HTTP request/response for patient linking.
 */
const patientLinkService = require('../services/patientLink.service');
const { createAuditLog } = require('../services/audit.service');
const { sendSuccess } = require('../utils/apiResponse');
const { AUDIT_ACTIONS, AUDIT_RESULTS } = require('../utils/constants');

/**
 * POST /api/patient-links/generate — Patient generates a linking code
 */
async function generateCode(req, res, next) {
  try {
    const result = await patientLinkService.generateCode(req.user.id);

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.PATIENT_LINK_CREATED,
      resourceType: 'patient_link',
      result: AUDIT_RESULTS.SUCCESS,
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Linking code generated',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/patient-links/resolve — Hospital/doctor resolves a linking code
 */
async function resolveCode(req, res, next) {
  try {
    const { code, hospitalId, doctorId } = req.body;

    const result = await patientLinkService.resolveCode({
      code,
      hospitalId,
      doctorId,
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.PATIENT_LINK_RESOLVED,
      resourceType: 'patient_link',
      resourceId: result.linkId,
      result: AUDIT_RESULTS.SUCCESS,
      metadata: {
        patientId: result.patientId,
        hospitalId,
      },
      ipAddress: req.ip,
    });

    return sendSuccess(res, {
      message: 'Patient linked successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/patient-links/history — Patient views their link history
 */
async function getLinkHistory(req, res, next) {
  try {
    const { page, limit } = req.query;

    const result = await patientLinkService.getPatientLinkHistory(req.user.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    return sendSuccess(res, {
      message: 'Link history retrieved',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/patient-links/patients/:hospitalId — Hospital views linked patients
 */
async function getLinkedPatients(req, res, next) {
  try {
    const { page, limit } = req.query;

    const result = await patientLinkService.getLinkedPatients(req.params.hospitalId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    return sendSuccess(res, {
      message: 'Linked patients retrieved',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateCode,
  resolveCode,
  getLinkHistory,
  getLinkedPatients,
};
