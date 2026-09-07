import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { Patient, PatientListParams } from '../types/patient.types.js';
import { store } from './store.js';

export class PatientRepository {
  async findAll(params: PatientListParams = {}): Promise<{ patients: Patient[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('patients').select('*', { count: 'exact' });

      if (params.search) {
        query = query.or(`full_name.ilike.%${params.search}%,patient_id.ilike.%${params.search}%`);
      }
      if (params.hospital_id) {
        query = query.eq('hospital_id', params.hospital_id);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { patients: (data || []) as Patient[], total: count || 0 };
    }

    let filtered = [...store.patients];
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.full_name.toLowerCase().includes(s) || p.patient_id.toLowerCase().includes(s)
      );
    }
    if (params.hospital_id) {
      filtered = filtered.filter((p) => p.hospital_id === params.hospital_id);
    }

    const total = filtered.length;
    const patients = filtered.slice(offset, offset + limit);
    return { patients, total };
  }

  async findById(id: string): Promise<Patient | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`id.eq.${id},patient_id.eq.${id}`)
        .single();
      if (error || !data) return null;
      return data as Patient;
    }

    return store.patients.find((p) => p.id === id || p.patient_id === id) || null;
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error || !data) return null;
      return data as Patient;
    }

    return store.patients.find((p) => p.user_id === userId) || null;
  }

  async create(patient: Patient): Promise<Patient> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('patients').insert(patient).select().single();
      if (error || !data) throw error;
      return data as Patient;
    }

    store.patients.push(patient);
    return patient;
  }
}

export const patientRepository = new PatientRepository();
