import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.get('/me', authenticate(), authController.getMe);
router.patch('/me', authenticate(), validate({ body: updateProfileSchema }), authController.updateMe);
router.post('/logout', authenticate({ optional: true }), authController.logout);

export default router;
