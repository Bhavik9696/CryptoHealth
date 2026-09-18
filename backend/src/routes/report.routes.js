const express = require('express');
const Joi = require('joi');
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate, validateParams } = require('../middleware/validate');
const { upload } = require('../middleware/upload');
const { ROLES } = require('../utils/constants');

const router = express.Router();
const reportIdParams = Joi.object({ id: Joi.string().uuid().required() });
const uploadSchema = Joi.object({
  patientId: Joi.string().uuid(),
  patient_id: Joi.string().uuid(),
  reportType: Joi.string().max(100),
  report_type: Joi.string().max(100),
  title: Joi.string().max(255).optional().allow(''),
  description: Joi.string().max(2000).optional().allow(''),
}).or('patientId', 'patient_id').or('reportType', 'report_type');

router.post('/', authenticate, authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR), upload.single('file'), validate(uploadSchema), reportController.uploadReport);
router.get('/', authenticate, authorize(ROLES.PATIENT, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.ADMIN), reportController.listReports);
router.get('/:id', authenticate, validateParams(reportIdParams), reportController.getReport);
router.get('/:id/file', authenticate, validateParams(reportIdParams), reportController.downloadReport);
router.delete('/:id', authenticate, authorize(ROLES.PATIENT), validateParams(reportIdParams), reportController.deleteReport);

module.exports = router;