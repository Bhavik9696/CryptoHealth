import { userRepository } from '../repositories/user.repository.js';
import { Profile } from '../types/auth.types.js';
import { auditService } from './audit.service.js';

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
