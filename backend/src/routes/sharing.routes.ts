import { Router } from 'express';
import { sharingController } from '../controllers/sharing.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createShareSchema, validateTokenSchema, accessShareSchema, shareListQuerySchema } from '../schemas/sharing.schema.js';
import { strictLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

router.get('/', authenticate(), validate({ query: shareListQuerySchema }), sharingController.getShares);
router.post('/', authenticate(), validate({ body: createShareSchema }), sharingController.createShare);

// getShareById requires full auth — unauthenticated callers cannot enumerate share metadata
router.get('/:shareId', authenticate(), sharingController.getShareById);

// validate and access: optional auth so unauthenticated public links still work,
// but if recipient_id is set on the share the service enforces the authenticated user matches
router.post('/validate', strictLimiter, authenticate({ optional: true }), validate({ body: validateTokenSchema }), sharingController.validateToken);
router.post('/access', strictLimiter, authenticate({ optional: true }), validate({ body: accessShareSchema }), sharingController.accessSharedReport);

router.post('/:shareId/revoke', authenticate(), sharingController.revokeShare);

export default router;
