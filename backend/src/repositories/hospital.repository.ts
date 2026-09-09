import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { Hospital, Doctor } from '../types/hospital.types.js';
import { store } from './store.js';

export class HospitalRepository {
  async findById(id: string): Promise<Hospital | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('hospitals').select('*').eq('id', id).single();
      if (error || !data) return null;
      return data as Hospital;
    }

    return store.hospitals.find((h) => h.id === id) || null;
  }

  async findAll(): Promise<Hospital[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('hospitals').select('*').order('name');
      if (error) throw error;
      return (data || []) as Hospital[];
    }

    return store.hospitals;
  }
}

export class DoctorRepository {
  async findById(id: string): Promise<Doctor | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('doctors').select('*').eq('id', id).single();
      if (error || !data) return null;
      return data as Doctor;
    }

    return store.doctors.find((d) => d.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Doctor | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error || !data) return null;
      return data as Doctor;
    }

    return store.doctors.find((d) => d.user_id === userId) || null;
  }

  async findByHospitalId(hospitalId: string): Promise<Doctor[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('hospital_id', hospitalId)
        .order('full_name');
      if (error) throw error;
      return (data || []) as Doctor[];
    }

    return store.doctors.filter((d) => d.hospital_id === hospitalId);
  }
}

export const hospitalRepository = new HospitalRepository();
export const doctorRepository = new DoctorRepository();
