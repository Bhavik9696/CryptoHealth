import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Download, ShieldCheck, ExternalLink } from 'lucide-react'
import { reportService } from '@/services/report.service'
import { verificationService } from '@/services/verification.service'
import { VerificationBadge } from '@/components/reports/VerificationBadge'
import { ReportViewer } from '@/components/reports/ReportViewer'
import { Loading } from '@/components/common/Loading'
import { ErrorState } from '@/components/common/ErrorState'
import { formatDate } from '@/lib/utils'
import { QUERY_KEYS } from '@/lib/constants'
import { toast } from 'sonner'

export default function ReportDetails() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerUrl, setViewerUrl] = useState('')

  const { data: report, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.REPORT(reportId!),
    queryFn: () => reportService.getReport(reportId!),
    enabled: !!reportId,
  })

  const { mutate: verify, isPending: verifying } = useMutation({
    mutationFn: () => verificationService.verifyReport(reportId!),
    onSuccess: (result) => {
      toast.success(result.signature_valid ? 'Report verified successfully!' : 'Verification failed — signature invalid')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORT(reportId!) })
    },
    onError: () => toast.error('Verification request failed'),
  })

  async function handleView() {
    try {
      const url = await reportService.getReportDownloadUrl(reportId!)
      setViewerUrl(url)
      setViewerOpen(true)
    } catch {
      toast.error('Unable to load report file')
    }
  }

  if (isLoading) return <Loading text="Loading report..." />
  if (isError || !report) return <ErrorState title="Report not found" onRetry={() => navigate('/reports')} />

  return (
    <>
      <div className="space-y-6 max-w-3xl">
        <button onClick={() => navigate('/reports')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </button>

        {/* Report card */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white text-xl font-bold">{report.report_type}</h2>
              <p className="text-slate-400 text-sm mt-0.5">{report.file_name}</p>
            </div>
            <VerificationBadge status={report.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 border-t border-slate-800 pt-5">
            {[
              { label: 'Patient', value: report.patient_name ?? report.patient_id },
              { label: 'Hospital', value: report.hospital_name ?? '—' },
              { label: 'Doctor', value: report.doctor_name ?? '—' },
              { label: 'Date Uploaded', value: formatDate(report.uploaded_at) },
              { label: 'Verified', value: report.verified_at ? formatDate(report.verified_at) : '—' },
              { label: 'Report ID', value: report.id.slice(0, 12) + '...' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-0.5">{item.label}</p>
                <p className="text-slate-200 text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification section */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            Verification
          </h3>
          <div className="flex items-center gap-3">
            <VerificationBadge status={report.status} />
            <span className="text-slate-400 text-sm">
              {report.status === 'VERIFIED' && 'This report passed cryptographic verification.'}
              {report.status === 'PENDING' && 'This report has not been verified yet.'}
              {report.status === 'INVALID' && 'This report could not be verified — signature mismatch.'}
              {report.status === 'REVOKED' && 'This report has been revoked.'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleView}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Report
          </button>
          <button
            onClick={() => verify()}
            disabled={verifying}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 border border-slate-700"
          >
            {verifying
              ? <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
              : <ShieldCheck className="w-4 h-4" />
            }
            {verifying ? 'Verifying...' : 'Verify Report'}
          </button>
          <button
            onClick={async () => {
              try {
                const url = await reportService.getReportDownloadUrl(reportId!)
                window.open(url, '_blank')
              } catch {
                toast.error('Download failed')
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {viewerOpen && report && (
        <ReportViewer report={report} url={viewerUrl} onClose={() => setViewerOpen(false)} />
      )}
    </>
  )
}
