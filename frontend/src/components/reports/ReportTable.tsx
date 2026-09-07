import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import type { MedicalReport } from '@/types/report'
import { VerificationBadge } from './VerificationBadge'
import { formatDate } from '@/lib/utils'

interface ReportTableProps {
  reports: MedicalReport[]
}

export function ReportTable({ reports }: ReportTableProps) {
  const navigate = useNavigate()

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-800/40">
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Type</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Patient</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Date</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr
              key={r.id}
              className="border-b border-slate-800/70 hover:bg-slate-800/30 transition-colors"
            >
              <td className="px-4 py-3 text-white font-medium">{r.report_type}</td>
              <td className="px-4 py-3 text-slate-300">{r.patient_name ?? r.patient_id}</td>
              <td className="px-4 py-3 text-slate-400">{formatDate(r.uploaded_at)}</td>
              <td className="px-4 py-3">
                <VerificationBadge status={r.status} size="sm" />
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => navigate(`/reports/${r.id}`)}
                  className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
                  aria-label={`View report ${r.report_type}`}
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
