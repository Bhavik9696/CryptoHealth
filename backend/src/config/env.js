const dotenv = require('dotenv');
const path = require('path');

// Runtime backend configuration lives in backend/.env.
dotenv.config({ path: path.join(__dirname, '../../.env') });

function firstDefined(...values) {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0);
}

function validateEnv() {
  const missing = [];
  if (!env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!env.SUPABASE_PUBLISHABLE_KEY) missing.push('SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY)');
  if (!env.SUPABASE_SECRET_KEY) missing.push('SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
  if (!env.MASTER_ENCRYPTION_KEY) missing.push('MASTER_ENCRYPTION_KEY (or ENCRYPTION_KEY)');

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    if (env.NODE_ENV === 'production') throw new Error(message);
    console.warn(`[CryptoHealth config] ${message}`);
  }

  if (env.MASTER_ENCRYPTION_KEY && !/^[0-9a-f]{64}$/i.test(env.MASTER_ENCRYPTION_KEY)) {
    throw new Error('MASTER_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
  }
}

const corsOrigins = firstDefined(
  process.env.CORS_ORIGINS,
  process.env.FRONTEND_URL,
  'http://localhost:5173,http://localhost:3000',
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const env = {
  PORT: Number.parseInt(process.env.PORT || '5000', 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: firstDefined(
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.SUPABASE_ANON_KEY,
  ),
  SUPABASE_SECRET_KEY: firstDefined(
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ),
  JWT_SECRET: process.env.JWT_SECRET,
  STORAGE_BUCKET: firstDefined(
    process.env.STORAGE_BUCKET,
    process.env.SUPABASE_STORAGE_BUCKET,
    'medical-reports',
  ),
  // The cors package accepts an array of allowed origins.
  FRONTEND_URL: corsOrigins,
  MASTER_ENCRYPTION_KEY: firstDefined(
    process.env.MASTER_ENCRYPTION_KEY,
    process.env.ENCRYPTION_KEY,
  ),
  PASSWORD_RESET_REDIRECT_URL: firstDefined(
    process.env.PASSWORD_RESET_REDIRECT_URL,
    `${corsOrigins[0] || 'http://localhost:5173'}/reset-password`,
  ),
};

module.exports = { env, validateEnv };
