import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { Share } from '../types/sharing.types.js';
import { store } from './store.js';

export interface ShareFilterParams {
  patient_id?: string;
  report_id?: string;
  created_by?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class SharingRepository {
  async findAll(params: ShareFilterParams = {}): Promise<{ shares: Share[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    // Check expiration and auto-update status
    const now = new Date();
    store.shares.forEach((s) => {
      if (s.status === 'ACTIVE' && new Date(s.expires_at) < now) {
        s.status = 'EXPIRED';
      }
    });

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('access_grants').select('*', { count: 'exact' });

      if (params.patient_id) query = query.eq('patient_id', params.patient_id);
      if (params.report_id) query = query.eq('report_id', params.report_id);
      if (params.created_by) query = query.eq('created_by', params.created_by);
      if (params.status) query = query.eq('status', params.status);

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { shares: (data || []) as Share[], total: count || 0 };
    }

    let filtered = [...store.shares];
    if (params.patient_id) filtered = filtered.filter((s) => s.patient_id === params.patient_id);
    if (params.report_id) filtered = filtered.filter((s) => s.report_id === params.report_id);
    if (params.created_by) filtered = filtered.filter((s) => s.created_by === params.created_by);
    if (params.status) filtered = filtered.filter((s) => s.status === params.status);

    const total = filtered.length;
    const shares = filtered.slice(offset, offset + limit);
    return { shares, total };
  }

  async findById(id: string): Promise<Share | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('access_grants')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return null;
      return data as Share;
    }

    const share = store.shares.find((s) => s.id === id) || null;
    if (share && share.status === 'ACTIVE' && new Date(share.expires_at) < new Date()) {
      share.status = 'EXPIRED';
    }
    return share;
  }

  async findByTokenHash(tokenHash: string): Promise<Share | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('access_grants')
        .select('*')
        .eq('token_hash', tokenHash)
        .single();
      if (error || !data) return null;
      return data as Share;
    }

    const share = store.shares.find((s) => s.token_hash === tokenHash) || null;
    if (share && share.status === 'ACTIVE' && new Date(share.expires_at) < new Date()) {
      share.status = 'EXPIRED';
    }
    return share;
  }

  async create(share: Share): Promise<Share> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('access_grants')
        .insert(share)
        .select()
        .single();
      if (error || !data) throw error;
      return data as Share;
    }

    store.shares.unshift(share);
    return share;
  }

  async update(id: string, updates: Partial<Share>): Promise<Share | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('access_grants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error || !data) return null;
      return data as Share;
    }

    const index = store.shares.findIndex((s) => s.id === id);
    if (index === -1) return null;
    store.shares[index] = {
      ...store.shares[index],
      ...updates,
    };
    return store.shares[index];
  }

  async revoke(id: string): Promise<Share | null> {
    return this.update(id, {
      status: 'REVOKED',
      revoked_at: new Date().toISOString(),
    });
  }
}

export const sharingRepository = new SharingRepository();
