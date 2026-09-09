import { Request, Response } from 'express';
import { sharingService } from '../services/sharing.service.js';
import { sendSuccess, sendPaginated, sendError } from '../utils/response.js';

export class SharingController {
  async getShares(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const patient_id = req.query.patient_id ? String(req.query.patient_id) : undefined;
    const report_id = req.query.report_id ? String(req.query.report_id) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;

    const { shares, total } = await sharingService.getShares(req.user, {
      page,
      limit,
      patient_id,
      report_id,
      status,
    });

    sendPaginated(res, shares, total, page, limit);
  }

  async getShareById(req: Request, res: Response): Promise<void> {
    const { shareId } = req.params;
    const share = await sharingService.getShareById(shareId);

    if (!share) {
      sendError(res, `Share grant with ID "${shareId}" not found`, 'NOT_FOUND', 404);
      return;
    }

    sendSuccess(res, share);
  }

  async createShare(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
      return;
    }

    try {
      const share = await sharingService.createShare(req.body, req.user, req.ip);
      sendSuccess(res, share, 'Temporary access grant created successfully', 201);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create temporary share';
      sendError(res, message, 'SHARE_ERROR', 400);
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    const { token } = req.body;
    if (!token) {
      sendError(res, 'Token is required', 'VALIDATION_ERROR', 422);
      return;
    }

    try {
      const share = await sharingService.validateToken(token, req.ip);
      sendSuccess(res, share, 'Share token verified and valid');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid or expired share token';
      const statusCode = message.includes('expired') || message.includes('revoked') ? 403 : 404;
      sendError(res, message, 'TOKEN_INVALID', statusCode);
    }
  }

  async revokeShare(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
      return;
    }

    const { shareId } = req.params;
    try {
      await sharingService.revokeShare(shareId, req.user, req.ip);
      sendSuccess(res, null, 'Share grant revoked successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to revoke share';
      sendError(res, message, 'REVOKE_ERROR', 400);
    }
  }
}

export const sharingController = new SharingController();
