import { Request, Response } from 'express';
import { auditService } from '../services/audit.service.js';
import { sendPaginated } from '../utils/response.js';

export class AuditController {
  async getLogs(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const user_id = req.query.user_id ? String(req.query.user_id) : undefined;
    const resource_id = req.query.resource_id ? String(req.query.resource_id) : undefined;
    const action = req.query.action ? String(req.query.action) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;

    const { logs, total } = await auditService.getLogs({
      page,
      limit,
      user_id,
      resource_id,
      action,
      status,
    });

    sendPaginated(res, logs, total, page, limit);
  }
}

export const auditController = new AuditController();
