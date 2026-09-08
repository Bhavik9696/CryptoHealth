/**
 * Hospital Routes — /api/hospitals
 */
const express = require('express');
const router = express.Router();
const Joi = require('joi');

const hospitalController = require('../controllers/hospital.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate, validateParams } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

// --- Validation Schemas ---

const createHospitalSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'any.required': 'Hospital name is required',
  }),
  registrationNumber: Joi.string().min(2).max(50).required().messages({
    'any.required': 'Registration number is required',
  }),
  address: Joi.string().max(500).optional().allow(''),
  city: Joi.string().max(100).optional().allow(''),
  state: Joi.string().max(100).optional().allow(''),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s()-]{7,20}$/)
    .optional()
    .allow(''),
  email: Joi.string().email().optional().allow(''),
});

const updateHospitalSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  address: Joi.string().max(500).optional().allow(''),
  city: Joi.string().max(100).optional().allow(''),
  state: Joi.string().max(100).optional().allow(''),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s()-]{7,20}$/)
    .optional()
    .allow(''),
  email: Joi.string().email().optional().allow(''),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const addStaffSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'any.required': 'User ID is required',
    'string.guid': 'User ID must be a valid UUID',
  }),
  role: Joi.string()
    .valid('admin', 'staff', 'lab_tech')
    .optional()
    .default('staff'),
});

const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

// --- Routes ---

// POST /api/hospitals — Register a new hospital (hospital_admin only)
router.post(
  '/',
  authenticate,
  authorize(ROLES.HOSPITAL_ADMIN, ROLES.ADMIN),
  validate(createHospitalSchema),
  hospitalController.createHospital
);

// GET /api/hospitals — List hospitals (any authenticated user)
router.get(
  '/',
  authenticate,
  hospitalController.listHospitals
);

// GET /api/hospitals/my-hospital — Get the hospital the current user belongs to
router.get(
  '/my-hospital',
  authenticate,
  authorize(ROLES.HOSPITAL_ADMIN),
  hospitalController.getMyHospital
);

// GET /api/hospitals/:id — Get hospital details
router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamSchema),
  hospitalController.getHospital
);

// PUT /api/hospitals/:id — Update hospital (hospital admin only)
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.HOSPITAL_ADMIN, ROLES.ADMIN),
  validateParams(uuidParamSchema),
  validate(updateHospitalSchema),
  hospitalController.updateHospital
);

// POST /api/hospitals/:id/staff — Add staff member
router.post(
  '/:id/staff',
  authenticate,
  authorize(ROLES.HOSPITAL_ADMIN),
  validateParams(uuidParamSchema),
  validate(addStaffSchema),
  hospitalController.addStaff
);

// GET /api/hospitals/:id/staff — List staff
router.get(
  '/:id/staff',
  authenticate,
  authorize(ROLES.HOSPITAL_ADMIN),
  validateParams(uuidParamSchema),
  hospitalController.listStaff
);

// DELETE /api/hospitals/:id/staff/:staffId — Remove staff member
router.delete(
  '/:id/staff/:staffId',
  authenticate,
  authorize(ROLES.HOSPITAL_ADMIN),
  hospitalController.removeStaff
);

module.exports = router;
