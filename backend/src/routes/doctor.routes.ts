import { Router } from 'express';
import { doctorController } from '../controllers/hospital.controller.js';
import { patientController } from '../controllers/patient.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', authenticate(), doctorController.getMe);
router.get('/patients', authenticate(), patientController.getPatients);

export default router;
