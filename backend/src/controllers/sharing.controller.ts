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
    if (!req.user) {
      sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
      return;
    }

    const { shareId } = req.params;
    try {
      const share = await sharingService.getShareById(shareId, req.user);
      if (!share) {
        sendError(res, `Share grant with ID "${shareId}" not found`, 'NOT_FOUND', 404);
        return;
      }
      sendSuccess(res, share);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve share';
      const statusCode = message.includes('denied') ? 403 : 400;
      sendError(res, message, statusCode === 403 ? 'FORBIDDEN' : 'SHARE_ERROR', statusCode);
    }
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
      // Pass authenticated user context (if any) for recipient enforcement
      const share = await sharingService.validateToken(token, req.user || undefined, req.ip);
      sendSuccess(res, share, 'Share token verified and valid');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid or expired share token';
      const statusCode =
        message.includes('expired') || message.includes('revoked') || message.includes('denied') ? 403
          : message.includes('Authentication required') ? 401
          : 404;
      sendError(res, message, 'TOKEN_INVALID', statusCode);
    }
  }

  /**
   * Access report data through a share token with scope enforcement.
   * POST /api/v1/shares/access { token, action: 'view' | 'download' }
   */
  async accessSharedReport(req: Request, res: Response): Promise<void> {
    const { token, action } = req.body;
    if (!token) {
      sendError(res, 'Token is required', 'VALIDATION_ERROR', 422);
      return;
    }

    const accessAction: 'view' | 'download' = action === 'download' ? 'download' : 'view';

    try {
      const result = await sharingService.accessSharedReport(
        token,
        accessAction,
        req.user || undefined,
        req.ip
      );

      if (accessAction === 'download' && result.file) {
        res.setHeader('Content-Type', result.file.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${result.file.fileName}"`);
        res.setHeader('Content-Length', result.file.buffer.length);
        res.send(result.file.buffer);
        return;
      }

      sendSuccess(res, result.report, 'Report accessed via share grant');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to access shared report';
      const statusCode =
        message.includes('denied') || message.includes('revoked') || message.includes('expired') ? 403
          : message.includes('Authentication required') ? 401
          : 404;
      sendError(res, message, statusCode === 403 ? 'FORBIDDEN' : 'ACCESS_ERROR', statusCode);
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
