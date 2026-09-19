/**
 * Access Grant Routes
 *
 * Patient-facing  →  /api/access-grants
 * Doctor-facing   →  /api/access-tokens
 */
const express = require('express');
const Joi = require('joi');

const accessGrantController = require('../controllers/accessGrant.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate, validateParams } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

// ─── Validation Schemas ───────────────────────────────────────────────────────

const createGrantSchema = Joi.object({
  reportId: Joi.string().uuid().required().messages({
    'any.required': 'reportId is required',
    'string.guid': 'reportId must be a valid UUID',
  }),
  scope: Joi.string().valid('view', 'download').default('view').messages({
    'any.only': 'scope must be "view" or "download"',
  }),
  expiresInHours: Joi.number().integer().min(1).max(168).default(24).messages({
    'number.min': 'expiresInHours must be at least 1',
    'number.max': 'expiresInHours cannot exceed 168 (7 days)',
  }),
  maxUses: Joi.number().integer().min(1).max(100).optional().allow(null).messages({
    'number.min': 'maxUses must be at least 1',
    'number.max': 'maxUses cannot exceed 100',
  }),
  recipientId: Joi.string().uuid().optional().allow(null).messages({
    'string.guid': 'recipientId must be a valid UUID',
  }),
});

const grantIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const tokenParamSchema = Joi.object({
  token: Joi.string().min(10).required(),
});

const validateTokenBodySchema = Joi.object({
  token: Joi.string().min(10).required().messages({
    'any.required': 'token is required',
    'string.min': 'token is too short',
  }),
});

// ─── Access Grant Router (Patient) ────────────────────────────────────────────

const grantRouter = express.Router();

// POST /api/access-grants — create a new access grant
grantRouter.post(
  '/',
  authenticate,
  authorize(ROLES.PATIENT),
  validate(createGrantSchema),
  accessGrantController.createGrant
);

// GET /api/access-grants — list patient's grants
grantRouter.get(
  '/',
  authenticate,
  authorize(ROLES.PATIENT),
  accessGrantController.listGrants
);

// GET /api/access-grants/:id — get a specific grant
grantRouter.get(
  '/:id',
  authenticate,
  authorize(ROLES.PATIENT),
  validateParams(grantIdParamSchema),
  accessGrantController.getGrant
);

// POST /api/access-grants/:id/revoke — revoke a grant
grantRouter.post(
  '/:id/revoke',
  authenticate,
  authorize(ROLES.PATIENT),
  validateParams(grantIdParamSchema),
  accessGrantController.revokeGrant
);

// ─── Access Token Router (Doctor) ─────────────────────────────────────────────

const tokenRouter = express.Router();

// POST /api/access-tokens/validate — doctor validates a token
tokenRouter.post(
  '/validate',
  authenticate,
  authorize(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  validate(validateTokenBodySchema),
  accessGrantController.validateToken
);

// GET /api/access-tokens/:token/report — doctor views report via token
tokenRouter.get(
  '/:token/report',
  authenticate,
  authorize(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN),
  validateParams(tokenParamSchema),
  accessGrantController.getReportViaToken
);

module.exports = { grantRouter, tokenRouter };
