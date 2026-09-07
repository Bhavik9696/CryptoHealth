import { AuditStatus } from '../config/constants.js';

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  status: AuditStatus;
  ip_address?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}
