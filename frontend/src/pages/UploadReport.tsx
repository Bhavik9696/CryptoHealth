import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { patientService } from '@/services/patient.service'
import { reportService } from '@/services/report.service'
import { ReportUpload } from '@/components/reports/ReportUpload'
import { toast } from 'sonner'
import { REPORT_TYPES } from '@/types/report'
import { QUERY_KEYS } from '@/lib/constants'

const schema = z.object({
  patient_id: z.string().min(1, 'Please select a patient'),
  report_type: z.string().min(1, 'Please select a report type'),
})

type FormValues = z.infer<typeof schema>
type UploadState = 'idle' | 'selected' | 'uploading' | 'processing' | 'success' | 'error'

export default function UploadReport() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | undefined>()

  const { data: patientsData } = useQuery({
    queryKey: QUERY_KEYS.PATIENTS,
    queryFn: () => patientService.getPatients({ limit: 100 }),
  })

  const patients = patientsData?.data ?? []

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    setUploadState('uploading')
    setUploadError(undefined)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('patient_id', values.patient_id)
      formData.append('report_type', values.report_type)

      await reportService.uploadReport(formData, (p) => {
        setProgress(p)
        if (p === 100) setUploadState('processing')
      })

      setUploadState('success')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTS })
      toast.success('Report uploaded successfully!')
      setTimeout(() => navigate('/reports'), 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setUploadState('error')
      setUploadError(message)
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => navigate('/reports')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Reports
      </button>

      <div>
        <h2 className="text-white text-xl font-bold">Upload Medical Report</h2>
        <p className="text-slate-400 text-sm mt-0.5">Upload a new medical report for a patient</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Patient select */}
        <div>
          <label htmlFor="patient_id" className="block text-sm font-medium text-slate-300 mb-1.5">Patient</label>
          <select
            id="patient_id"
            {...register('patient_id')}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
          >
            <option value="">Select Patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name} — {p.patient_id}</option>
            ))}
          </select>
          {errors.patient_id && <p className="text-red-400 text-xs mt-1">{errors.patient_id.message}</p>}
        </div>

        {/* Report type select */}
        <div>
          <label htmlFor="report_type" className="block text-sm font-medium text-slate-300 mb-1.5">Report Type</label>
          <select
            id="report_type"
            {...register('report_type')}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
          >
            <option value="">Select Type</option>
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.report_type && <p className="text-red-400 text-xs mt-1">{errors.report_type.message}</p>}
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Medical Report File</label>
          <ReportUpload
            onFileSelected={(file) => { setSelectedFile(file); setUploadState('selected') }}
            onClear={() => { setSelectedFile(null); setUploadState('idle') }}
            selectedFile={selectedFile}
            uploadState={uploadState}
            progress={progress}
            error={uploadError}
          />
        </div>

        {uploadState !== 'uploading' && uploadState !== 'processing' && uploadState !== 'success' && (
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-semibold rounded-lg transition-all text-sm shadow-lg shadow-sky-500/20"
          >
            Upload Report
          </button>
        )}
      </form>
    </div>
  )
}
