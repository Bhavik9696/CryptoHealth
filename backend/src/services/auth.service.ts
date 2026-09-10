import { userRepository } from '../repositories/user.repository.js';
import { Profile } from '../types/auth.types.js';
import { auditService } from './audit.service.js';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import type { UserRole } from '../config/constants.js';

export class AuthService {
  async getProfile(userId: string): Promise<Profile | null> {
    return userRepository.findByUserId(userId);
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const updated = await userRepository.updateProfile(userId, updates);
    if (updated) {
      await auditService.log({
        userId,
        userName: updated.full_name,
        action: 'PROFILE_UPDATE',
        resourceType: 'user_profile',
        resourceId: userId,
        status: 'SUCCESS',
      });
    }
    return updated;
  }

  async register(
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    phone?: string,
    ipAddress?: string
  ) {
    // Check if user already exists
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error('A user with this email already exists');
    }

    let userId: string;
    let token: string;

    if (isSupabaseConfigured && supabase) {
      // Production mode: create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          throw new Error('A user with this email already exists');
        }
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Registration failed');
      }

      userId = authData.user.id;

      // Sign in to get a session token
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !signInData.session) {
        token = `session-${userId}`;
      } else {
        token = signInData.session.access_token;
      }
    } else {
      // Development mode: generate local ID and dev token
      userId = crypto.randomUUID();
      token = `dev-token-${role}-${userId}`;
    }

    // Create profile
    const profile: Profile = {
      id: userId,
      user_id: userId,
      role,
      full_name: fullName,
      email,
      verification_status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    try {
      await userRepository.createProfile(profile);
    } catch (profileError) {
      // If profile creation fails in Supabase mode, clean up the auth user
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.auth.admin.deleteUser(userId);
        } catch {
          // Best-effort cleanup
        }
      }
      throw new Error('Failed to create user profile');
    }

    const user = {
      id: userId,
      email,
      created_at: profile.created_at,
    };

    await auditService.log({
      userId,
      userName: fullName,
      action: 'USER_REGISTERED',
      resourceType: 'auth',
      resourceId: userId,
      status: 'SUCCESS',
      ipAddress,
    });

    return {
      token,
      user,
      profile,
    };
  }

  async login(email: string, _password: string, ipAddress?: string) {
    let profile = await userRepository.findByEmail(email);

    if (!profile) {
      // Auto-provision demo account for unseeded email if needed
      const normalizedRole = email.includes('doctor')
        ? 'doctor'
        : email.includes('hospital')
        ? 'hospital'
        : 'patient';

      const newId = crypto.randomUUID();
      profile = {
        id: newId,
        user_id: newId,
        role: normalizedRole,
        full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        email,
        verification_status: 'VERIFIED',
        created_at: new Date().toISOString(),
      };
      await userRepository.createProfile(profile);
    }

    const token = `dev-token-${profile.role}-${profile.user_id}`;
    const user = {
      id: profile.user_id,
      email: profile.email,
      created_at: profile.created_at,
    };

    await auditService.log({
      userId: profile.user_id,
      userName: profile.full_name,
      action: 'LOGIN',
      resourceType: 'auth',
      resourceId: profile.user_id,
      status: 'SUCCESS',
      ipAddress,
    });

    return {
      token,
      user,
      profile,
    };
  }

  async logout(userId: string, ipAddress?: string): Promise<void> {
    await auditService.log({
      userId,
      action: 'LOGOUT',
      resourceType: 'auth',
      resourceId: userId,
      status: 'SUCCESS',
      ipAddress,
    });
  }
}

export const authService = new AuthService();
