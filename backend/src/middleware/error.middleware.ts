import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error & { status?: number; statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = err.message || 'An unexpected error occurred';

  if (env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error('[Unhandled Error]', err);
  }

  sendError(
    res,
    statusCode >= 500 && env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : message,
    errorCode,
    statusCode
  );
}
