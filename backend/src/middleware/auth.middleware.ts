import { Request, Response, NextFunction } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendError } from '../utils/response.js';
import { AuthContextUser } from '../types/auth.types.js';
import { env } from '../config/env.js';

export interface AuthOptions {
  optional?: boolean;
}

/**
 * Allowed development-only bearer tokens.
 * In dev mode, ONLY these explicit tokens are accepted — arbitrary tokens are rejected.
 */
const DEV_TOKEN_MAP: Record<string, string> = {
  'dev-doctor': 'doctor@cryptohealth.example.com',
  'dev-hospital': 'hospital@cryptohealth.example.com',
  'dev-patient': 'patient@cryptohealth.example.com',
  'mock-token-patient': 'patient@cryptohealth.example.com',
};

let devWarningLogged = false;

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

      // 2. Supabase not configured — block entirely in production
      if (env.NODE_ENV === 'production') {
        console.error('[SECURITY] Supabase is not configured. Authentication is unavailable in production.');
        sendError(res, 'Authentication service unavailable', 'SERVICE_UNAVAILABLE', 503);
        return;
      }

      // 3. Development-only mode: accept ONLY explicit dev tokens
      if (!devWarningLogged) {
        console.warn('[SECURITY WARNING] Running with development mock authentication. Use dev-doctor, dev-hospital, or dev-patient tokens.');
        devWarningLogged = true;
      }

      const devEmail = DEV_TOKEN_MAP[token];
      if (!devEmail) {
        if (options.optional) return next();
        sendError(
          res,
          'Invalid token. In development mode, use: dev-doctor, dev-hospital, or dev-patient',
          'UNAUTHORIZED',
          401
        );
        return;
      }

      const profile = await userRepository.findByEmail(devEmail);

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
