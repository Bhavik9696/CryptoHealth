import { useNavigate } from 'react-router-dom'
import type { MedicalReport } from '@/types/report'
import { VerificationBadge } from '@/components/reports/VerificationBadge'
import { formatDate } from '@/lib/utils'

interface RecentReportsProps {
  reports: MedicalReport[]
}

export function RecentReports({ reports }: RecentReportsProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-slate-900 font-semibold text-sm">Recent Reports</h2>
        <button
          onClick={() => navigate('/reports')}
          className="text-teal-600 hover:text-teal-700 text-xs font-medium transition-colors"
        >
          View all
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs">Patient</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs">Type</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs">Date</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.slice(0, 8).map((r) => (
              <tr
                key={r.id}
                onClick={() => navigate(`/reports/${r.id}`)}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3 text-slate-600">{r.patient_name ?? r.patient_id}</td>
                <td className="px-5 py-3 text-slate-900 font-medium">{r.report_type}</td>
                <td className="px-5 py-3 text-slate-500">{formatDate(r.uploaded_at)}</td>
                <td className="px-5 py-3">
                  <VerificationBadge status={r.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {reports.length === 0 && (
        <div className="py-10 text-center text-slate-500 text-sm">No recent reports</div>
      )}
    </div>
  )
}
