import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { env } from '../config/env.js';
import { MedicalReport } from '../types/report.types.js';
import { store } from './store.js';

export interface ReportFilterParams {
  patient_id?: string;
  hospital_id?: string;
  doctor_id?: string;
  status?: string;
  report_type?: string;
  page?: number;
  limit?: number;
}

export class ReportRepository {
  async findAll(params: ReportFilterParams = {}): Promise<{ reports: MedicalReport[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('medical_reports').select('*', { count: 'exact' });

      if (params.patient_id) query = query.eq('patient_id', params.patient_id);
      if (params.hospital_id) query = query.eq('hospital_id', params.hospital_id);
      if (params.doctor_id) query = query.eq('doctor_id', params.doctor_id);
      if (params.status) query = query.eq('status', params.status);
      if (params.report_type) query = query.eq('report_type', params.report_type);

      const { data, count, error } = await query
        .order('uploaded_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { reports: (data || []) as MedicalReport[], total: count || 0 };
    }

    let filtered = [...store.reports];
    if (params.patient_id) filtered = filtered.filter((r) => r.patient_id === params.patient_id);
    if (params.hospital_id) filtered = filtered.filter((r) => r.hospital_id === params.hospital_id);
    if (params.doctor_id) filtered = filtered.filter((r) => r.doctor_id === params.doctor_id);
    if (params.status) filtered = filtered.filter((r) => r.status === params.status);
    if (params.report_type) filtered = filtered.filter((r) => r.report_type === params.report_type);

    const total = filtered.length;
    const reports = filtered.slice(offset, offset + limit);
    return { reports, total };
  }

  async findById(id: string): Promise<MedicalReport | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return null;
      return data as MedicalReport;
    }

    return store.reports.find((r) => r.id === id) || null;
  }

  async findByPatientId(patientId: string): Promise<MedicalReport[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('patient_id', patientId)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return (data || []) as MedicalReport[];
    }

    return store.reports.filter((r) => r.patient_id === patientId);
  }

  async create(report: MedicalReport): Promise<MedicalReport> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('medical_reports')
        .insert(report)
        .select()
        .single();
      if (error || !data) throw error;
      return data as MedicalReport;
    }

    store.reports.unshift(report);
    return report;
  }

  async update(id: string, updates: Partial<MedicalReport>): Promise<MedicalReport | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('medical_reports')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error || !data) return null;
      return data as MedicalReport;
    }

    const index = store.reports.findIndex((r) => r.id === id);
    if (index === -1) return null;
    store.reports[index] = {
      ...store.reports[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return store.reports[index];
  }

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('medical_reports').delete().eq('id', id);
      return !error;
    }

    const index = store.reports.findIndex((r) => r.id === id);
    if (index === -1) return false;
    store.reports.splice(index, 1);
    return true;
  }

  async saveFile(storagePath: string, buffer: Buffer, mimeType: string = 'application/octet-stream'): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });
      if (error) throw error;
      return storagePath;
    }

    store.files.set(storagePath, buffer);
    return storagePath;
  }

  async getFile(storagePath: string): Promise<Buffer | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .download(storagePath);
      if (error || !data) return null;
      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    return store.files.get(storagePath) || null;
  }
}

export const reportRepository = new ReportRepository();
