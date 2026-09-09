import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
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
        await fetchProfile()
        return
      } catch (err) {
        console.error('Failed to parse cached user', err)
      }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user as User)
        await fetchProfile()
        return
      }
    } catch {
      // ignore
    }

    setUser(null)
    setProfile(null)
    setLoading(false)
  }

  useEffect(() => {
    checkAuth()

    const handleAuthChange = () => {
      checkAuth()
    }
    window.addEventListener('crypto_health_auth_change', handleAuthChange)

    let subscription: { unsubscribe: () => void } | null = null
    try {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user as User)
          fetchProfile()
        } else if (!localStorage.getItem('crypto_health_token')) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      })
      subscription = data.subscription
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('crypto_health_auth_change', handleAuthChange)
      subscription?.unsubscribe()
    }
  }, [])

  async function fetchProfile() {
    try {
      const profileData = await authService.getProfile()
      setProfile(profileData)
    } catch {
      // Profile fetch may fail if backend isn't running; gracefully degrade
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    await authService.signOut()
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
