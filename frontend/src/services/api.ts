import axios from 'axios'
import { API_URL } from '@/lib/constants'

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach access token to every request from localStorage
apiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('crypto_health_token')
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
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
