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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-slate-900 font-semibold text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900 leading-tight">{profile?.full_name ?? '—'}</p>
            <p className="text-xs text-slate-500 capitalize">{profile?.role ?? 'Loading...'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-semibold text-sm border border-teal-200">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
