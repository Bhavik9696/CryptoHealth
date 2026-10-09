const { createClient } = require('@supabase/supabase-js');
const { env } = require('./env');

// Use inert local placeholders only so the API health endpoint and public
// documentation can run before Supabase is configured. Production startup is
// blocked by validateEnv() when any required backend credential is missing.
const supabaseUrl = env.SUPABASE_URL || 'http://127.0.0.1:54321';
const publishableKey = env.SUPABASE_PUBLISHABLE_KEY || 'local-development-placeholder-key';
const secretKey = env.SUPABASE_SECRET_KEY || 'local-development-placeholder-key';

/** Client for user-scoped authentication operations. */
const supabase = createClient(supabaseUrl, publishableKey);

/**
 * Server-only administrative client. Its secret key bypasses RLS and must
 * never be sent to the browser or mobile application.
 */
const supabaseAdmin = createClient(supabaseUrl, secretKey);

module.exports = { supabase, supabaseAdmin };
