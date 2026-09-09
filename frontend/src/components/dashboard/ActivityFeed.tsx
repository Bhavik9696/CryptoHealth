import { CheckCircle, Upload, Share2, ShieldCheck, LogOut } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import type { AuditLog } from '@/types/api'

const actionIcons: Record<string, React.ElementType> = {
  'Report View': CheckCircle,
  'Report Upload': Upload,
  'Share Access': Share2,
  'Report Verify': ShieldCheck,
  'Logout': LogOut,
}

interface ActivityFeedProps {
  logs: AuditLog[]
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-white font-semibold text-sm">Recent Activity</h2>
      </div>
      <div className="divide-y divide-slate-800/50">
        {logs.slice(0, 8).map((log) => {
          const Icon = actionIcons[log.action] ?? CheckCircle
          const isSuccess = log.status === 'SUCCESS'
          return (
            <div key={log.id} className="flex items-start gap-3 px-5 py-3.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isSuccess ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                <Icon className={`w-4 h-4 ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{log.action}</p>
                <p className="text-slate-400 text-xs">{log.user_name ?? 'Unknown'}</p>
              </div>
              <p className="text-slate-500 text-xs whitespace-nowrap shrink-0">{formatDateTime(log.created_at)}</p>
            </div>
          )
        })}
        {logs.length === 0 && (
          <div className="py-10 text-center text-slate-500 text-sm">No recent activity</div>
        )}
      </div>
    </div>
  )
}
