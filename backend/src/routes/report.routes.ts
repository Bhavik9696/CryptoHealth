import { Router } from 'express';
import { reportController } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { reportListQuerySchema } from '../schemas/report.schema.js';

const router = Router();

router.get('/', authenticate(), validate({ query: reportListQuerySchema }), reportController.getReports);
router.post('/', authenticate(), upload.single('file'), reportController.uploadReport);
router.get('/:reportId', authenticate(), reportController.getReportById);
router.get('/:reportId/download', authenticate(), reportController.getDownloadUrl);
router.get('/:reportId/file', authenticate({ optional: true }), reportController.downloadFile);
router.delete('/:reportId', authenticate(), reportController.deleteReport);

export default router;
