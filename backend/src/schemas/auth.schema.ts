import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s()-]{7,20}$/, 'Please provide a valid phone number')
    .optional()
    .or(z.literal('')),
  role: z.enum(['patient', 'doctor', 'hospital'], {
    errorMap: () => ({ message: 'Role must be one of: patient, doctor, hospital' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  avatar_url: z.string().url().optional(),
});
