import { Router } from 'express';
import { patientController } from '../controllers/patient.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { patientListQuerySchema } from '../schemas/patient.schema.js';

const router = Router();

router.get('/', authenticate(), validate({ query: patientListQuerySchema }), patientController.getPatients);
router.get('/:patientId', authenticate(), patientController.getPatientById);
router.get('/:patientId/reports', authenticate(), patientController.getPatientReports);

export default router;
