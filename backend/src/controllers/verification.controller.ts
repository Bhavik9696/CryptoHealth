import { Request, Response } from 'express';
import { verificationService } from '../services/verification.service.js';
import { auditService } from '../services/audit.service.js';
import { sendSuccess, sendPaginated, sendError } from '../utils/response.js';

export class VerificationController {
  async verifyReport(req: Request, res: Response): Promise<void> {
    const { reportId } = req.params;

    try {
      const result = await verificationService.verifyReport(reportId, req.ip);
      sendSuccess(res, result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      sendError(res, message, 'VERIFICATION_ERROR', 404);
    }
  }
}

export const verificationController = new VerificationController();
