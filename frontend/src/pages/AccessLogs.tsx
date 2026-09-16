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
    SUCCESS: 'text-teal-700 bg-teal-50 border-teal-200',
    DENIED: 'text-red-700 bg-red-50 border-red-200',
    ERROR: 'text-amber-700 bg-amber-50 border-amber-200',
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-slate-900 text-xl font-bold">Access History</h2>
        <p className="text-slate-500 text-sm mt-0.5">Audit trail of all access events</p>
      </div>

      {isLoading ? (
        <Loading text="Loading access logs..." />
      ) : isError ? (
        <ErrorState title="Unable to load access logs" onRetry={refetch} />
      ) : logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No Access Logs" description="No access events have been recorded yet." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">Action</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    <td className="px-4 py-3 text-slate-600">{log.user_name ?? 'Unknown'}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{log.action}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[log.status] ?? 'text-slate-600 bg-slate-100 border-slate-200'}`}>
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
              <p className="text-slate-500 text-sm">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors shadow-sm" aria-label="Previous page">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors shadow-sm" aria-label="Next page">
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
