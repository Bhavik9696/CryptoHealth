import { Router } from 'express';
import { hospitalController } from '../controllers/hospital.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', authenticate(), hospitalController.getMe);
router.get('/doctors', authenticate(), hospitalController.getDoctors);
router.get('/reports', authenticate(), hospitalController.getReports);

export default router;
