import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  Upload,
  ShieldCheck,
  Share2,
  ScrollText,
  User,
  LogOut,
  X,
  Activity,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/auth'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['patient', 'doctor', 'hospital', 'admin'] },
  { label: 'Patients', path: '/patients', icon: Users, roles: ['doctor', 'hospital', 'admin'] },
  { label: 'Reports', path: '/reports', icon: FileText, roles: ['patient', 'doctor', 'hospital', 'admin'] },
  { label: 'Upload Report', path: '/reports/upload', icon: Upload, roles: ['doctor', 'hospital'] },
  { label: 'Verification', path: '/verification', icon: ShieldCheck, roles: ['doctor', 'hospital', 'admin'] },
  { label: 'Sharing', path: '/sharing', icon: Share2, roles: ['patient', 'doctor', 'hospital'] },
  { label: 'Access Logs', path: '/access-logs', icon: ScrollText, roles: ['hospital', 'admin'] },
  { label: 'Activity', path: '/access-logs', icon: Activity, roles: ['patient'] },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const role = profile?.role

  const visibleItems = navItems.filter((item) => !role || item.roles.includes(role))

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-900 font-bold text-lg tracking-tight">CryptoHealth</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-md"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {visibleItems.map((item) => (
          <NavLink
            key={item.label + item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-teal-50 text-teal-700 border border-teal-100 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )
            }
          >
            <item.icon className="w-4.5 h-4.5 shrink-0" size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4 space-y-2">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-teal-50 text-teal-700 border border-teal-100 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            )
          }
        >
          <User size={18} />
          Profile
        </NavLink>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative w-72 flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
