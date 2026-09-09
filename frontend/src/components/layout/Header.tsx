import { Menu, Bell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getInitials } from '@/lib/utils'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/reports': 'Reports',
  '/reports/upload': 'Upload Report',
  '/verification': 'Verification',
  '/sharing': 'Sharing',
  '/access-logs': 'Access Logs',
  '/profile': 'Profile',
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { profile } = useAuth()
  const location = useLocation()

  const title = pageTitles[location.pathname]
    ?? (location.pathname.startsWith('/patients/') ? 'Patient Details'
    : location.pathname.startsWith('/reports/') ? 'Report Details'
    : 'CryptoHealth')

  const initials = profile ? getInitials(profile.full_name) : '?'

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-white font-semibold text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">{profile?.full_name ?? '—'}</p>
            <p className="text-xs text-slate-400 capitalize">{profile?.role ?? 'Loading...'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
