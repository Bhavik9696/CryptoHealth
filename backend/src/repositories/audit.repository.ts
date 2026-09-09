import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { AuditLog } from '../types/audit.types.js';
import { store } from './store.js';

export interface AuditFilterParams {
  user_id?: string;
  resource_id?: string;
  action?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class AuditRepository {
  async create(log: AuditLog): Promise<AuditLog> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('audit_logs').insert(log).select().single();
      if (error || !data) throw error;
      return data as AuditLog;
    }

    store.auditLogs.unshift(log);
    return log;
  }

  async findAll(params: AuditFilterParams = {}): Promise<{ logs: AuditLog[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('audit_logs').select('*', { count: 'exact' });

      if (params.user_id) query = query.eq('user_id', params.user_id);
      if (params.resource_id) query = query.eq('resource_id', params.resource_id);
      if (params.action) query = query.eq('action', params.action);
      if (params.status) query = query.eq('status', params.status);

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { logs: (data || []) as AuditLog[], total: count || 0 };
    }

    let filtered = [...store.auditLogs];
    if (params.user_id) filtered = filtered.filter((l) => l.user_id === params.user_id);
    if (params.resource_id) filtered = filtered.filter((l) => l.resource_id === params.resource_id);
    if (params.action) filtered = filtered.filter((l) => l.action === params.action);
    if (params.status) filtered = filtered.filter((l) => l.status === params.status);

    const total = filtered.length;
    const logs = filtered.slice(offset, offset + limit);
    return { logs, total };
  }
}

export const auditRepository = new AuditRepository();
