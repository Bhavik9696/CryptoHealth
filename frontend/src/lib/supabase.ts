/**
 * Supabase client stub.
 *
 * The frontend does NOT connect to Supabase directly.
 * All authentication and data operations go through the backend API
 * (frontend → backend → Supabase).
 *
 * This module is kept as a no-op stub so that any legacy imports
 * do not cause build errors. All methods are safe no-ops.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

const noopAuth = {
  getSession: async () => ({ data: { session: null }, error: null }),
  getUser: async () => ({ data: { user: null }, error: null }),
  signInWithPassword: async (_creds: { email: string; password: string }) => {
    throw new Error('Direct Supabase auth is disabled. Use the backend API.')
  },
  signUp: async (_creds: { email: string; password: string }) => {
    throw new Error('Direct Supabase auth is disabled. Use the backend API.')
  },
  signOut: async () => ({ error: null }),
  onAuthStateChange: (_cb: unknown) => ({
    data: { subscription: { unsubscribe: () => {} } },
  }),
  resetPasswordForEmail: async (_email: string, _opts?: unknown) => {
    throw new Error('Password reset should go through the backend API.')
  },
  updateUser: async (_updates: unknown) => {
    throw new Error('User updates should go through the backend API.')
  },
}

export const supabase = { auth: noopAuth } as unknown as {
  auth: typeof noopAuth
}
