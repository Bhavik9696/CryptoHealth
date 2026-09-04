const { createClient } = require('@supabase/supabase-js');
const { env } = require('./env');

/**
 * Supabase client with publishable key — used for auth operations
 * that respect Row Level Security (RLS).
 */
const supabase = createClient(
  env.SUPABASE_URL || '',
  env.SUPABASE_PUBLISHABLE_KEY || ''
);

/**
 * Supabase admin client with secret key — bypasses RLS.
 * Use ONLY for server-side operations that need full access
 * (e.g., creating profiles, admin queries, storage operations).
 *
 * The secret key (formerly "service role key") has FULL access
 * to your database, bypassing all Row Level Security policies.
 * NEVER expose this key to the client/frontend.
 */
const supabaseAdmin = createClient(
  env.SUPABASE_URL || '',
  env.SUPABASE_SECRET_KEY || ''
);

module.exports = { supabase, supabaseAdmin };
