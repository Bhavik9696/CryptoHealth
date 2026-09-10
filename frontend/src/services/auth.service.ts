import apiClient from './api'
import type { Profile } from '@/types/auth'

/**
 * Auth service — all authentication goes through the backend API.
 * The frontend does NOT connect to Supabase directly.
 *
 * Flow: Frontend → Backend API (/api/auth/*) → Supabase
 */
export const authService = {
  async signIn(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password })
    const result = response.data

    if (result.success && result.data) {
      const { user, session } = result.data

      // Store the access token returned by backend (Supabase JWT)
      if (session?.access_token) {
        localStorage.setItem('crypto_health_token', session.access_token)
      }

      // Store user data (merged user+profile from backend)
      if (user) {
        localStorage.setItem('crypto_health_user', JSON.stringify({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        }))
        localStorage.setItem('crypto_health_profile', JSON.stringify(user))
      }

      window.dispatchEvent(new Event('crypto_health_auth_change'))
      return { user, session }
    }

    throw new Error(result.message || 'Login failed')
  },

  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: 'patient' | 'doctor' | 'hospital_admin',
    phone?: string,
  ) {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      fullName,
      phone: phone || undefined,
      role,
    })
    const result = response.data

    if (result.success && result.data) {
      const { user, session } = result.data

      if (session?.access_token) {
        localStorage.setItem('crypto_health_token', session.access_token)
      }

      if (user) {
        localStorage.setItem('crypto_health_user', JSON.stringify({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        }))
        localStorage.setItem('crypto_health_profile', JSON.stringify(user))
      }

      window.dispatchEvent(new Event('crypto_health_auth_change'))
      return { user, session }
    }

    throw new Error(result.message || 'Registration failed')
  },

  async signOut() {
    // Save token before clearing for the logout API call
    const token = localStorage.getItem('crypto_health_token')

    localStorage.removeItem('crypto_health_token')
    localStorage.removeItem('crypto_health_user')
    localStorage.removeItem('crypto_health_profile')
    window.dispatchEvent(new Event('crypto_health_auth_change'))

    if (token) {
      try {
        await apiClient.post('/auth/logout', null, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        // ignore — user is logged out locally regardless
      }
    }
  },

  async sendPasswordResetEmail(email: string) {
    // Password reset goes through backend API
    const response = await apiClient.post('/auth/forgot-password', { email })
    return response.data
  },

  async updatePassword(newPassword: string) {
    // Password update goes through backend API
    const response = await apiClient.post('/auth/reset-password', {
      password: newPassword,
    })
    return response.data
  },

  async getProfile(): Promise<Profile> {
    const response = await apiClient.get<{ data: Profile }>('/auth/me')
    return response.data.data
  },
}
