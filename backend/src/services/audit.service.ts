import crypto from 'crypto';
import { auditRepository, AuditFilterParams } from '../repositories/audit.repository.js';
import { AuditLog } from '../types/audit.types.js';
import { AuditStatus } from '../config/constants.js';

export interface LogEventParams {
  userId?: string;
  userName?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  status: AuditStatus;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  async log(params: LogEventParams): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      user_id: params.userId,
      user_name: params.userName,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      status: params.status,
      ip_address: params.ipAddress,
      metadata: params.metadata,
      created_at: new Date().toISOString(),
    };

    return auditRepository.create(auditLog);
  }

  async getLogs(params: AuditFilterParams = {}) {
    return auditRepository.findAll(params);
  }
}

export const auditService = new AuditService();
