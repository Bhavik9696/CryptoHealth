const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'JWT_SECRET',
];

/**
 * Validate that all required environment variables are set.
 * Throws on missing vars in production, warns in development.
 */
function validateEnv() {
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    }
    console.warn(`⚠️  ${msg}`);
  }
}

const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  STORAGE_BUCKET: process.env.STORAGE_BUCKET || 'medical-reports',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  MASTER_ENCRYPTION_KEY: process.env.MASTER_ENCRYPTION_KEY,
};

module.exports = { env, validateEnv };
