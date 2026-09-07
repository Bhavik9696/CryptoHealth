import { z } from 'zod';

export const uploadReportBodySchema = z.object({
  patient_id: z.string().min(1, 'Patient ID is required'),
  report_type: z.string().min(1, 'Report type is required'),
  notes: z.string().optional(),
});

export const reportListQuerySchema = z.object({
  patient_id: z.string().optional(),
  hospital_id: z.string().optional(),
  doctor_id: z.string().optional(),
  status: z.string().optional(),
  report_type: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});
