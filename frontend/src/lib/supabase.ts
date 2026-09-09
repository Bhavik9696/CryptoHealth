import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidHttpUrl = (urlString?: string): boolean => {
  if (!urlString) return false
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const isConfigured = isValidHttpUrl(rawUrl) && Boolean(rawKey && rawKey !== 'your_supabase_anon_key')

if (!isConfigured) {
  console.warn(
    'Supabase environment variables are missing or invalid in .env.local. Please provide a valid VITE_SUPABASE_URL (e.g. https://your-project.supabase.co) and VITE_SUPABASE_ANON_KEY.'
  )
}

const supabaseUrl = isValidHttpUrl(rawUrl) ? rawUrl! : 'https://placeholder.supabase.co'
const supabaseAnonKey = isConfigured ? (rawKey as string) : 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
