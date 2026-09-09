import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { reportService } from '@/services/report.service'
import { ReportTable } from '@/components/reports/ReportTable'
import { PatientSearch } from '@/components/patients/PatientSearch'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { FileText, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import { QUERY_KEYS } from '@/lib/constants'
import type { ReportStatus } from '@/types/report'

const STATUS_OPTIONS: { label: string; value: ReportStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Verified', value: 'VERIFIED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Invalid', value: 'INVALID' },
  { label: 'Revoked', value: 'REVOKED' },
]

export default function Reports() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ReportStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const limit = 15

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.REPORTS, search, status, page],
    queryFn: () => reportService.getReports({
      search,
      status: status === 'ALL' ? undefined : status,
      page,
      limit,
    }),
  })

  const reports = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Medical Reports</h2>
          <p className="text-slate-400 text-sm mt-0.5">{data?.total ?? 0} total reports</p>
        </div>
        <button
          onClick={() => navigate('/reports/upload')}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="sm:max-w-xs flex-1">
          <PatientSearch onSearch={(q) => { setSearch(q); setPage(1) }} placeholder="Search reports..." />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatus(opt.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                status === opt.value
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Loading text="Loading reports..." />
      ) : isError ? (
        <ErrorState title="Unable to load reports" message="Something went wrong while fetching reports." onRetry={refetch} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports found"
          description={search || status !== 'ALL' ? 'No reports matched your filters.' : 'No medical reports have been uploaded yet.'}
          action={{ label: 'Upload Report', onClick: () => navigate('/reports/upload') }}
        />
      ) : (
        <>
          <ReportTable reports={reports} />

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
