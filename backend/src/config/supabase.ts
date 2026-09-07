import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const isSupabaseConfigured = Boolean(
  env.SUPABASE_URL &&
    env.SUPABASE_SERVICE_ROLE_KEY &&
    env.SUPABASE_URL.startsWith('http') &&
    !env.SUPABASE_URL.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
