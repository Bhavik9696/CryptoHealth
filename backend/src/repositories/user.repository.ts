import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { Profile } from '../types/auth.types.js';
import { store } from './store.js';

export class UserRepository {
  async findByUserId(userId: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error || !data) return null;
      return data as Profile;
    }

    return store.profiles.find((p) => p.user_id === userId || p.id === userId) || null;
  }

  async findByEmail(email: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      if (error || !data) return null;
      return data as Profile;
    }

    return store.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();
      if (error || !data) return null;
      return data as Profile;
    }

    const index = store.profiles.findIndex((p) => p.user_id === userId || p.id === userId);
    if (index === -1) return null;

    store.profiles[index] = {
      ...store.profiles[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return store.profiles[index];
  }

  async createProfile(profile: Profile): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').insert(profile).select().single();
      if (error || !data) throw error;
      return data as Profile;
    }

    store.profiles.push(profile);
    return profile;
  }
}

export const userRepository = new UserRepository();
