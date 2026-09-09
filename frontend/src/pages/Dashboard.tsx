import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Users, FileText, Share2, Upload } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentReports } from '@/components/dashboard/RecentReports'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { SkeletonCard } from '@/components/common/Loading'
import { reportService } from '@/services/report.service'
import { auditService } from '@/services/audit.service'
import { QUERY_KEYS } from '@/lib/constants'

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: QUERY_KEYS.REPORTS,
    queryFn: () => reportService.getReports({ limit: 10 }),
  })

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: QUERY_KEYS.AUDIT_LOGS,
    queryFn: () => auditService.getLogs({ limit: 8 }),
  })

  const reports = reportsData?.data ?? []
  const logs = logsData?.data ?? []
  const totalReports = reportsData?.total ?? 0

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h2 className="text-white text-2xl font-bold">
          Welcome, {profile?.full_name ?? 'Doctor'} 👋
        </h2>
        <p className="text-slate-400 text-sm mt-1 capitalize">{profile?.role} · {profile?.hospital_id ? 'Hospital Portal' : 'CryptoHealth'}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Reports" value={totalReports} icon={FileText} color="blue" />
            <StatCard title="Verified Reports" value={reports.filter(r => r.status === 'VERIFIED').length} icon={FileText} color="emerald" />
            <StatCard title="Pending Verification" value={reports.filter(r => r.status === 'PENDING').length} icon={FileText} color="amber" />
            <StatCard title="Active Shares" value={0} icon={Share2} color="purple" />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Upload Report', icon: Upload, path: '/reports/upload', color: 'sky' },
          { label: 'All Patients', icon: Users, path: '/patients', color: 'emerald' },
          { label: 'All Reports', icon: FileText, path: '/reports', color: 'amber' },
          { label: 'Sharing', icon: Share2, path: '/sharing', color: 'purple' },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="bg-slate-800/60 border border-slate-700/60 hover:border-sky-500/50 hover:bg-slate-800 rounded-xl p-4 text-left transition-all duration-200 group"
          >
            <action.icon className="w-5 h-5 text-slate-400 group-hover:text-sky-400 mb-2 transition-colors" />
            <p className="text-white text-sm font-medium">{action.label}</p>
          </button>
        ))}
      </div>

      {/* Reports + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentReports reports={reports} />
        </div>
        <div>
          <ActivityFeed logs={logs} />
        </div>
      </div>
    </div>
  )
}
