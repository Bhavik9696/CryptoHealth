import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/api.types.js';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  const responsePayload: ApiResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  return res.status(statusCode).json(responsePayload);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  statusCode: number = 200
): Response {
  const totalPages = Math.ceil(total / Math.max(limit, 1)) || 1;
  const responsePayload: PaginatedResponse<T> = {
    success: true,
    data,
    total,
    page,
    limit,
    totalPages,
  };
  return res.status(statusCode).json(responsePayload);
}

export function sendError(
  res: Response,
  message: string,
  code: string = 'ERROR',
  statusCode: number = 400,
  details?: unknown
): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}
