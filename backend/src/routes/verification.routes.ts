import { Router } from 'express';
import { verificationController } from '../controllers/verification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { strictLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

router.post('/reports/:reportId', strictLimiter, authenticate({ optional: true }), verificationController.verifyReport);
router.get('/reports/:reportId', authenticate({ optional: true }), verificationController.verifyReport);

export default router;
