/**
 * Auth Routes — /api/auth
 */
const express = require('express');
const router = express.Router();
const Joi = require('joi');

const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { ROLES } = require('../utils/constants');

// --- Validation Schemas ---

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required',
  }),
  fullName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Full name must be at least 2 characters',
    'any.required': 'Full name is required',
  }),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s()-]{7,20}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
  role: Joi.string()
    .valid(ROLES.PATIENT, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR)
    .required()
    .messages({
      'any.only': `Role must be one of: ${ROLES.PATIENT}, ${ROLES.HOSPITAL_ADMIN}, ${ROLES.DOCTOR}`,
      'any.required': 'Role is required',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s()-]{7,20}$/)
    .optional()
    .allow(''),
  avatar_url: Joi.string().uri().optional().allow(''),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// --- Routes ---

// POST /api/auth/register
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

// PUT /api/auth/profile
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
