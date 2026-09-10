import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService } from '@/services/auth.service'
import type { AuthContextType, User, Profile } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function checkAuth() {
    const storedToken = localStorage.getItem('crypto_health_token')
    const storedUser = localStorage.getItem('crypto_health_user')
    const storedProfile = localStorage.getItem('crypto_health_profile')

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile))
        }
        // Verify session is still valid by fetching profile from backend
        await fetchProfile()
        return
      } catch (err) {
        console.error('Failed to restore auth session', err)
        // Clear invalid stored data
        localStorage.removeItem('crypto_health_token')
        localStorage.removeItem('crypto_health_user')
        localStorage.removeItem('crypto_health_profile')
      }
    }

    // No valid stored session
    setUser(null)
    setProfile(null)
    setLoading(false)
  }

  useEffect(() => {
    checkAuth()

    // Listen for auth changes from authService (login/logout/register)
    const handleAuthChange = () => {
      checkAuth()
    }
    window.addEventListener('crypto_health_auth_change', handleAuthChange)

    return () => {
      window.removeEventListener('crypto_health_auth_change', handleAuthChange)
    }
  }, [])

  async function fetchProfile() {
    try {
      const profileData = await authService.getProfile()
      setProfile(profileData)

      // Also update user from profile data
      if (profileData) {
        setUser({
          id: profileData.id || profileData.user_id,
          email: profileData.email,
          created_at: profileData.created_at,
        })
      }
    } catch {
      // Profile fetch failed — token may be expired
      // Clear auth state so ProtectedRoute redirects to login
      localStorage.removeItem('crypto_health_token')
      localStorage.removeItem('crypto_health_user')
      localStorage.removeItem('crypto_health_profile')
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    await authService.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
