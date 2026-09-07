import { X, ShieldCheck } from 'lucide-react'
import { VerificationBadge } from './VerificationBadge'
import type { MedicalReport } from '@/types/report'

interface ReportViewerProps {
  report: MedicalReport
  url: string
  onClose: () => void
}

export function ReportViewer({ report, url, onClose }: ReportViewerProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold">{report.report_type}</h2>
          <VerificationBadge status={report.status} size="sm" />
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close report viewer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* PDF iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={url}
          title={`Medical report: ${report.report_type}`}
          className="w-full h-full"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 border-t border-slate-800 text-sm text-slate-400">
        <ShieldCheck className="w-4 h-4 text-sky-400" />
        <span>Report accessed via CryptoHealth secure viewer</span>
      </div>
    </div>
  )
}
