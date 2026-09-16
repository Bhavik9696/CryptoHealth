import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, User, Upload } from 'lucide-react'
import { patientService } from '@/services/patient.service'
import { reportService } from '@/services/report.service'
import { ReportTable } from '@/components/reports/ReportTable'
import { Loading } from '@/components/common/Loading'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate } from '@/lib/utils'
import { QUERY_KEYS } from '@/lib/constants'
import { FileText } from 'lucide-react'

export default function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()

  const { data: patient, isLoading: patientLoading, isError: patientError } = useQuery({
    queryKey: QUERY_KEYS.PATIENT(patientId!),
    queryFn: () => patientService.getPatient(patientId!),
    enabled: !!patientId,
  })

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: QUERY_KEYS.PATIENT_REPORTS(patientId!),
    queryFn: () => reportService.getPatientReports(patientId!),
    enabled: !!patientId,
  })

  if (patientLoading) return <Loading text="Loading patient..." />
  if (patientError || !patient) return (
    <ErrorState title="Patient not found" message="Unable to load patient information." onRetry={() => navigate('/patients')} />
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </button>

      {/* Patient info card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-teal-600" />
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-0.5">Full Name</p>
              <p className="text-slate-900 font-semibold">{patient.full_name}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-0.5">Patient ID</p>
              <p className="text-slate-700 font-mono text-sm">{patient.patient_id}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-0.5">Hospital</p>
              <p className="text-slate-700">{patient.hospital_name ?? '—'}</p>
            </div>
            {patient.date_of_birth && (
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-0.5">Date of Birth</p>
                <p className="text-slate-700">{formatDate(patient.date_of_birth)}</p>
              </div>
            )}
            {patient.gender && (
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-0.5">Gender</p>
                <p className="text-slate-700 capitalize">{patient.gender}</p>
              </div>
            )}
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-0.5">Registered</p>
              <p className="text-slate-700">{formatDate(patient.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-semibold">Medical Reports</h3>
          <button
            onClick={() => navigate('/reports/upload')}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Upload Report
          </button>
        </div>

        {reportsLoading ? (
          <Loading text="Loading reports..." />
        ) : !reports || reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Medical Reports"
            description="This patient does not have any medical reports yet."
            action={{ label: 'Upload Report', onClick: () => navigate('/reports/upload') }}
          />
        ) : (
          <ReportTable reports={reports} />
        )}
      </div>
    </div>
  )
}
