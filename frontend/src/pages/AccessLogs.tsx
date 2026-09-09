import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auditService } from '@/services/audit.service'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { QUERY_KEYS } from '@/lib/constants'

export default function AccessLogs() {
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, page],
    queryFn: () => auditService.getLogs({ page, limit }),
  })

  const logs = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  const statusClasses: Record<string, string> = {
    SUCCESS: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    DENIED: 'text-red-400 bg-red-500/10 border-red-500/30',
    ERROR: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white text-xl font-bold">Access History</h2>
        <p className="text-slate-400 text-sm mt-0.5">Audit trail of all access events</p>
      </div>

      {isLoading ? (
        <Loading text="Loading access logs..." />
      ) : isError ? (
        <ErrorState title="Unable to load access logs" onRetry={refetch} />
      ) : logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No Access Logs" description="No access events have been recorded yet." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/40">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Action</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/70 hover:bg-slate-800/20">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    <td className="px-4 py-3 text-slate-300">{log.user_name ?? 'Unknown'}</td>
                    <td className="px-4 py-3 text-white">{log.action}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[log.status] ?? 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{log.ip_address ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-slate-400 text-sm">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors" aria-label="Previous page">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors" aria-label="Next page">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
