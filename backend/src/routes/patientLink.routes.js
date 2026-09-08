/**
 * Patient Link Routes — /api/patient-links
 */
const express = require('express');
const router = express.Router();
const Joi = require('joi');

const patientLinkController = require('../controllers/patientLink.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate, validateParams } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

// --- Validation Schemas ---

const resolveCodeSchema = Joi.object({
  code: Joi.string().length(8).required().messages({
    'any.required': 'Linking code is required',
    'string.length': 'Linking code must be exactly 8 characters',
  }),
  hospitalId: Joi.string().uuid().required().messages({
    'any.required': 'Hospital ID is required',
    'string.guid': 'Hospital ID must be a valid UUID',
  }),
  doctorId: Joi.string().uuid().optional().allow(null).messages({
    'string.guid': 'Doctor ID must be a valid UUID',
  }),
});

const hospitalIdParamSchema = Joi.object({
  hospitalId: Joi.string().uuid().required(),
});

// --- Routes ---

// POST /api/patient-links/generate — Patient generates a linking code
router.post(
  '/generate',
  authenticate,
  authorize(ROLES.PATIENT),
  patientLinkController.generateCode
);

// POST /api/patient-links/resolve — Hospital/doctor resolves a linking code
router.post(
  '/resolve',
  authenticate,
  authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR),
  validate(resolveCodeSchema),
  patientLinkController.resolveCode
);

// GET /api/patient-links/history — Patient views their link history
router.get(
  '/history',
  authenticate,
  authorize(ROLES.PATIENT),
  patientLinkController.getLinkHistory
);

// GET /api/patient-links/patients/:hospitalId — Hospital views linked patients
router.get(
  '/patients/:hospitalId',
  authenticate,
  authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR),
  validateParams(hospitalIdParamSchema),
  patientLinkController.getLinkedPatients
);

module.exports = router;
