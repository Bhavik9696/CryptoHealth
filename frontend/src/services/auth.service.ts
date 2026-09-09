import { supabase } from '@/lib/supabase'
import apiClient from './api'
import type { Profile } from '@/types/auth'

export const authService = {
  async signIn(email: string, password: string) {
    try {
      // 1. Authenticate with backend API
      const response = await apiClient.post('/auth/login', { email, password })
      const data = response.data?.data
      if (data?.token) {
        localStorage.setItem('crypto_health_token', data.token)
      }
      if (data?.user) {
        localStorage.setItem('crypto_health_user', JSON.stringify(data.user))
      }
      if (data?.profile) {
        localStorage.setItem('crypto_health_profile', JSON.stringify(data.profile))
      }
      window.dispatchEvent(new Event('crypto_health_auth_change'))
      return { user: data?.user, session: { access_token: data?.token } }
    } catch {
      // 2. Fallback to Supabase Auth directly if configured
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    }
  },

  async signOut() {
    localStorage.removeItem('crypto_health_token')
    localStorage.removeItem('crypto_health_user')
    localStorage.removeItem('crypto_health_profile')
    window.dispatchEvent(new Event('crypto_health_auth_change'))

    try {
      await apiClient.post('/auth/logout')
    } catch {
      // ignore
    }

    try {
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
  },

  async sendPasswordResetEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  },

  async getProfile(): Promise<Profile> {
    const response = await apiClient.get<{ data: Profile }>('/auth/me')
    return response.data.data
  },
}
