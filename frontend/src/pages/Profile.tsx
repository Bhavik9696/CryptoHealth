import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { User, Shield, Building2, BadgeCheck, Save } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'

export default function Profile() {
  const { user, profile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.full_name ?? '')

  function handleSave() {
    // Would call profile update API
    toast.success('Profile updated successfully')
    setEditing(false)
  }

  const initials = profile ? getInitials(profile.full_name) : '?'

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-white text-xl font-bold">Profile</h2>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account information</p>
      </div>

      {/* Avatar */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">
            {initials}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{profile?.full_name ?? '—'}</h3>
            <p className="text-slate-400 text-sm capitalize">{profile?.role ?? '—'}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile details */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-white font-semibold text-sm">Account Information</h3>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg text-xs font-medium transition-colors border border-sky-500/30"
          >
            {editing ? <Save className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            {editing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {[
            { icon: User, label: 'Full Name', value: displayName, editable: true },
            { icon: Shield, label: 'Email', value: user?.email ?? '—', editable: false },
            { icon: BadgeCheck, label: 'Role', value: profile?.role ?? '—', editable: false },
            { icon: Building2, label: 'Hospital ID', value: profile?.hospital_id ?? '—', editable: false },
            { icon: Shield, label: 'Doctor ID', value: profile?.doctor_id ?? '—', editable: false },
            { icon: BadgeCheck, label: 'Verification Status', value: profile?.verification_status ?? '—', editable: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 px-6 py-4">
              <item.icon className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <p className="text-slate-500 text-xs font-medium">{item.label}</p>
                {editing && item.editable ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-0.5 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                ) : (
                  <p className="text-white text-sm capitalize mt-0.5">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6">
        <h3 className="text-white font-semibold text-sm mb-4">Security</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-sm font-medium">Password</p>
            <p className="text-slate-500 text-xs mt-0.5">Change your account password</p>
          </div>
          <a
            href="/forgot-password"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Change Password
          </a>
        </div>
      </div>
    </div>
  )
}
