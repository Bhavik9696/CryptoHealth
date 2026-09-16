import { FileText, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { MedicalReport } from '@/types/report'
import { VerificationBadge } from './VerificationBadge'
import { formatDate } from '@/lib/utils'

interface ReportCardProps {
  report: MedicalReport
}

export function ReportCard({ report }: ReportCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/reports/${report.id}`)}
      className="bg-white border border-slate-200 hover:border-teal-500 rounded-xl p-5 cursor-pointer transition-all duration-200 group shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-slate-900 font-medium text-sm group-hover:text-teal-700 transition-colors">
              {report.report_type}
            </p>
            <p className="text-slate-500 text-xs">{report.patient_name ?? report.patient_id}</p>
          </div>
        </div>
        <VerificationBadge status={report.status} size="sm" />
      </div>

      <div className="flex items-center gap-2 text-slate-500 text-xs">
        <Calendar className="w-3.5 h-3.5" />
        {formatDate(report.uploaded_at)}
        {report.hospital_name && (
          <>
            <span className="text-slate-300">·</span>
            <span>{report.hospital_name}</span>
          </>
        )}
      </div>
    </div>
  )
}
