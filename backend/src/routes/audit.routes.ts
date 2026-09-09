import { Router } from 'express';
import { auditController } from '../controllers/audit.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/logs', authenticate(), auditController.getLogs);

export default router;
