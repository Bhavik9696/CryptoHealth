import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types/auth'

interface RoleRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { profile, loading } = useAuth()

  if (loading) return null

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
