/**
 * Doctor Routes — /api/doctors
 */
const express = require('express');
const router = express.Router();
const Joi = require('joi');

const doctorController = require('../controllers/doctor.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate, validateParams } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

// --- Validation Schemas ---

const registerDoctorSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'any.required': 'User ID is required',
    'string.guid': 'User ID must be a valid UUID',
  }),
  hospitalId: Joi.string().uuid().required().messages({
    'any.required': 'Hospital ID is required',
    'string.guid': 'Hospital ID must be a valid UUID',
  }),
  licenseNumber: Joi.string().min(2).max(50).required().messages({
    'any.required': 'License number is required',
  }),
  specialization: Joi.string().max(100).optional().allow(''),
});

const updateDoctorSchema = Joi.object({
  specialization: Joi.string().max(100).optional(),
  license_number: Joi.string().min(2).max(50).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const hospitalIdParamSchema = Joi.object({
  hospitalId: Joi.string().uuid().required(),
});

// --- Routes ---

// POST /api/doctors — Register a doctor (hospital_admin only)
router.post(
  '/',
  authenticate,
  authorize(ROLES.HOSPITAL_ADMIN, ROLES.ADMIN),
  validate(registerDoctorSchema),
  doctorController.registerDoctor
);

// GET /api/doctors/me — Get current doctor's profile
router.get(
  '/me',
  authenticate,
  authorize(ROLES.DOCTOR),
  doctorController.getMyProfile
);

// GET /api/doctors/hospital/:hospitalId — List doctors at a hospital
router.get(
  '/hospital/:hospitalId',
  authenticate,
  validateParams(hospitalIdParamSchema),
  doctorController.listDoctorsByHospital
);

// GET /api/doctors/:id — Get a specific doctor
router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamSchema),
  doctorController.getDoctor
);

// PUT /api/doctors/:id — Update doctor details
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.ADMIN),
  validateParams(uuidParamSchema),
  validate(updateDoctorSchema),
  doctorController.updateDoctor
);

// PATCH /api/doctors/:id/verify — Verify a doctor (admin only)
router.patch(
  '/:id/verify',
  authenticate,
  authorize(ROLES.ADMIN),
  validateParams(uuidParamSchema),
  doctorController.verifyDoctor
);

// DELETE /api/doctors/:id — Deactivate a doctor (hospital admin)
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.HOSPITAL_ADMIN, ROLES.ADMIN),
  validateParams(uuidParamSchema),
  doctorController.deactivateDoctor
);

module.exports = router;
