import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { email, password, fullName, phone, role } = req.body;

    try {
      const result = await authService.register(email, password, fullName, role, phone, req.ip);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';

      if (message.includes('already exists')) {
        sendError(res, message, 'CONFLICT', 409);
        return;
      }

      sendError(res, message, 'REGISTRATION_ERROR', 400);
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      sendError(res, 'Unauthenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const profile = await authService.getProfile(req.user.id);
    if (!profile) {
      sendError(res, 'User profile not found', 'NOT_FOUND', 404);
      return;
    }

    sendSuccess(res, profile, 'Profile retrieved successfully');
  }

  async updateMe(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      sendError(res, 'Unauthenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const updated = await authService.updateProfile(req.user.id, req.body);
    if (!updated) {
      sendError(res, 'Profile update failed', 'BAD_REQUEST', 400);
      return;
    }

    sendSuccess(res, updated, 'Profile updated successfully');
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    if (!email || !password) {
      sendError(res, 'Email and password are required', 'VALIDATION_ERROR', 422);
      return;
    }

    try {
      const result = await authService.login(email, password, req.ip);
      sendSuccess(res, result, 'Logged in successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      sendError(res, message, 'AUTH_ERROR', 401);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    if (req.user) {
      await authService.logout(req.user.id, req.ip);
    }
    sendSuccess(res, null, 'Logged out successfully');
  }
}

export const authController = new AuthController();
