import { z } from 'zod';

export const createShareSchema = z.object({
  report_id: z.string().min(1, 'Report ID is required'),
  recipient_id: z.string().optional(),
  duration_minutes: z.coerce.number().min(1).max(1440 * 7).default(60),
  can_view: z.boolean().default(true),
  can_download: z.boolean().default(false),
});

export const validateTokenSchema = z.object({
  token: z.string().min(1, 'Access token is required'),
});

export const shareListQuerySchema = z.object({
  patient_id: z.string().optional(),
  report_id: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});
