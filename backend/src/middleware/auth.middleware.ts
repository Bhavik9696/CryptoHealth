import { Request, Response, NextFunction } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendError } from '../utils/response.js';
import { AuthContextUser } from '../types/auth.types.js';

export interface AuthOptions {
  optional?: boolean;
}

export function authenticate(options: AuthOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (options.optional) {
        return next();
      }
      sendError(res, 'Authentication required. Missing or malformed authorization token.', 'UNAUTHORIZED', 401);
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      // 1. If Supabase is configured, verify token with Supabase Auth
      if (isSupabaseConfigured && supabase) {
        const { data: authData, error: authError } = await supabase.auth.getUser(token);
        if (authError || !authData.user) {
          if (options.optional) return next();
          sendError(res, 'Invalid or expired authentication token', 'UNAUTHORIZED', 401);
          return;
        }

        const profile = await userRepository.findByUserId(authData.user.id);
        const user: AuthContextUser = {
          id: authData.user.id,
          email: authData.user.email || profile?.email || '',
          role: profile?.role || 'patient',
          profile: profile || undefined,
        };

        req.user = user;
        return next();
      }

      // 2. Development / Fallback mode: resolve profile by token or test identifiers
      let profile = null;

      if (token.includes('doctor')) {
        profile = await userRepository.findByEmail('doctor@cryptohealth.example.com');
      } else if (token.includes('hospital')) {
        profile = await userRepository.findByEmail('hospital@cryptohealth.example.com');
      } else if (token.includes('patient') || token === 'mock-token-patient') {
        profile = await userRepository.findByEmail('patient@cryptohealth.example.com');
      } else {
        // Try to find profile by user_id or id matching the token, or fallback to first patient
        profile = (await userRepository.findByUserId(token)) ||
                  (await userRepository.findByEmail('patient@cryptohealth.example.com'));
      }

      if (!profile) {
        if (options.optional) return next();
        sendError(res, 'Invalid authentication credentials', 'UNAUTHORIZED', 401);
        return;
      }

      const user: AuthContextUser = {
        id: profile.user_id,
        email: profile.email,
        role: profile.role,
        profile,
      };

      req.user = user;
      next();
    } catch {
      if (options.optional) return next();
      sendError(res, 'Authentication processing failed', 'UNAUTHORIZED', 401);
    }
  };
}
