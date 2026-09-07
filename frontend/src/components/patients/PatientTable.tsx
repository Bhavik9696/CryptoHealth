import { useNavigate } from 'react-router-dom'
import { Eye, User } from 'lucide-react'
import type { Patient } from '@/types/patient'
import { formatDate } from '@/lib/utils'

interface PatientTableProps {
  patients: Patient[]
}

export function PatientTable({ patients }: PatientTableProps) {
  const navigate = useNavigate()

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-800/40">
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Patient ID</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Name</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Hospital</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Reports</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Registered</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr
              key={p.id}
              className="border-b border-slate-800/70 hover:bg-slate-800/30 transition-colors"
            >
              <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.patient_id}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-white font-medium">{p.full_name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-400">{p.hospital_name ?? '—'}</td>
              <td className="px-4 py-3 text-slate-300">{p.report_count ?? 0}</td>
              <td className="px-4 py-3 text-slate-400">{formatDate(p.created_at)}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => navigate(`/patients/${p.id}`)}
                  className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
                  aria-label={`View patient ${p.full_name}`}
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
