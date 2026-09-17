import dotenv from 'dotenv';
import crypto from 'crypto';
import { z } from 'zod';

dotenv.config();

/**
 * Generates a fallback encryption key for development only.
 * In production, ENCRYPTION_KEY MUST be set explicitly — an empty string will
 * fail the 64-char length validation, giving a clear startup error.
 */
function getEncryptionKeyDefault(): string {
  if ((process.env.NODE_ENV || 'development') === 'production') {
    return ''; // intentionally invalid — triggers zod validation error with a clear message
  }
  const devKey = crypto.randomBytes(32).toString('hex');
  console.warn(
    '[SECURITY WARNING] No ENCRYPTION_KEY set. Auto-generated an ephemeral key for this session. ' +
    'Data encrypted now will be UNRECOVERABLE after restart. ' +
    'Generate a persistent key: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
  return devKey;
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  APP_NAME: z.string().default('Crypto Health API'),
  APP_URL: z.string().default('http://localhost:5000'),
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  SUPABASE_STORAGE_BUCKET: z.string().default('medical-reports'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  ENCRYPTION_KEY: z
    .string()
    .length(64, 'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"')
    .default(getEncryptionKeyDefault()),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(500),
});

export const env = envSchema.parse(process.env);
