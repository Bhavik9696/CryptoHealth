import axios from 'axios'
import { API_URL } from '@/lib/constants'
import { supabase } from '@/lib/supabase'

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach access token to every request (localStorage or Supabase)
apiClient.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('crypto_health_token')
  if (!token) {
    try {
      const { data } = await supabase.auth.getSession()
      token = data.session?.access_token || null
    } catch {
      // ignore
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle global error responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('crypto_health_token')
      localStorage.removeItem('crypto_health_user')
      localStorage.removeItem('crypto_health_profile')
      try {
        await supabase.auth.signOut()
      } catch {
        // ignore
      }
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
