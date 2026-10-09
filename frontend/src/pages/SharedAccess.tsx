import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowLeft, Download, FileText, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { sharingService } from '@/services/sharing.service'
import { Loading } from '@/components/common/Loading'

export default function SharedAccess() {
  const { token = '' } = useParams<{ token: string }>()
  const [fileUrl, setFileUrl] = useState('')
  const [opening, setOpening] = useState(false)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['shared-access', token],
    queryFn: () => sharingService.validateShare(token),
    enabled: !!token,
    retry: false,
  })

  useEffect(() => () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
  }, [fileUrl])

  async function openReport() {
    setOpening(true)
    try {
      const url = await sharingService.getSharedFileUrl(token)
      setFileUrl((oldUrl) => {
        if (oldUrl) URL.revokeObjectURL(oldUrl)
        return url
      })
    } catch {
      toast.error('This share is no longer available, has expired, or does not permit access.')
    } finally {
      setOpening(false)
    }
  }

  if (isLoading) return <Loading text="Validating temporary access..." />
  if (isError || !data) {
    const message = error instanceof Error ? error.message : 'This temporary share is invalid or expired.'
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-amber-200 bg-white p-8">
        <AlertTriangle className="w-8 h-8 text-amber-600 mb-3" />
        <h1 className="text-xl font-bold text-slate-900">Access unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <p className="mt-2 text-sm text-slate-500">Ask the patient to create a new share if this link has expired or been revoked.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 mt-5 text-teal-700"><ArrowLeft className="w-4 h-4" /> Return to dashboard</Link>
      </div>
    )
  }

  const { grant, report } = data
  const isDownload = grant.scope === 'download'
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link to="/sharing" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm"><ArrowLeft className="w-4 h-4" /> Temporary access</Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-teal-50 p-3"><FileText className="w-6 h-6 text-teal-700" /></div>
          <div className="flex-1">
            <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-slate-900">{report.title || report.report_type}</h1><span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-1">Token valid</span></div>
            <p className="text-sm text-slate-500 mt-1">{report.file_name} · {report.report_type}</p>
            <p className="text-xs text-slate-500 mt-2">Access expires {new Date(grant.expiresAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
          <p>{isDownload ? 'The patient granted download access. The file is decrypted server-side and integrity-checked before it is returned.' : 'The patient granted view access. The file is streamed inline with server-side integrity verification. Browser settings may still allow saving displayed files.'}</p>
        </div>
        <button onClick={openReport} disabled={opening} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-700 hover:bg-teal-800 px-4 py-2.5 text-white text-sm font-medium disabled:opacity-60">
          <Download className="w-4 h-4" /> {opening ? 'Opening report...' : (isDownload ? 'Download shared report' : 'View shared report')}
        </button>
      </div>
      {fileUrl && <div className="bg-white border border-slate-200 rounded-xl overflow-hidden h-[70vh]"><iframe src={fileUrl} title="Authorized shared medical report" className="w-full h-full" /></div>}
    </div>
  )
}
