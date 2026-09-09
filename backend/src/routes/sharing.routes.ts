import { Router } from 'express';
import { sharingController } from '../controllers/sharing.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createShareSchema, validateTokenSchema, shareListQuerySchema } from '../schemas/sharing.schema.js';
import { strictLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

router.get('/', authenticate(), validate({ query: shareListQuerySchema }), sharingController.getShares);
router.post('/', authenticate(), validate({ body: createShareSchema }), sharingController.createShare);
router.get('/:shareId', authenticate({ optional: true }), sharingController.getShareById);
router.post('/validate', strictLimiter, validate({ body: validateTokenSchema }), sharingController.validateToken);
router.post('/:shareId/revoke', authenticate(), sharingController.revokeShare);

export default router;
