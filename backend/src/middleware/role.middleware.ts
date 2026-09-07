import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../config/constants.js';
import { sendError } from '../utils/response.js';

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
      sendError(
        res,
        `Access denied. Required role: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        'FORBIDDEN',
        403
      );
      return;
    }

    next();
  };
}
