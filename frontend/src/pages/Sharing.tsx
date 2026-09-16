import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Clock, CheckCircle, MinusCircle } from 'lucide-react'
import { sharingService } from '@/services/sharing.service'
import { reportService } from '@/services/report.service'
import { ShareDialog } from '@/components/sharing/ShareDialog'
import { QRCodeDisplay } from '@/components/sharing/QRCodeDisplay'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDateTime, getTimeRemaining } from '@/lib/utils'
import { QUERY_KEYS } from '@/lib/constants'
import type { Share, CreateSharePayload } from '@/types/sharing'
import type { MedicalReport } from '@/types/report'
import { toast } from 'sonner'

const statusIcon: Record<string, React.ElementType> = {
  ACTIVE: CheckCircle,
  EXPIRED: Clock,
  REVOKED: MinusCircle,
}

const statusClasses: Record<string, string> = {
  ACTIVE: 'text-teal-700 bg-teal-50 border-teal-200',
  EXPIRED: 'text-slate-700 bg-slate-100 border-slate-200',
  REVOKED: 'text-red-700 bg-red-50 border-red-200',
}

export default function Sharing() {
  const queryClient = useQueryClient()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [qrShare, setQrShare] = useState<Share | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<Share | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.SHARES,
    queryFn: () => sharingService.getShares(),
  })

  const { data: reportsData } = useQuery({
    queryKey: QUERY_KEYS.REPORTS,
    queryFn: () => reportService.getReports({ limit: 100 }),
  })

  const shares = data?.data ?? []
  const reports: MedicalReport[] = reportsData?.data ?? []
  const activeShares = shares.filter((s) => s.status === 'ACTIVE')

  const { mutate: createShare, isPending: creating } = useMutation({
    mutationFn: (payload: CreateSharePayload) => sharingService.createShare(payload),
    onSuccess: (newShare) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHARES })
      setShareDialogOpen(false)
      setQrShare(newShare)
      toast.success('Temporary access created')
    },
    onError: () => toast.error('Failed to create share'),
  })

  const { mutate: revokeShare, isPending: revoking } = useMutation({
    mutationFn: (shareId: string) => sharingService.revokeShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHARES })
      setRevokeTarget(null)
      setQrShare(null)
      toast.success('Access revoked')
    },
    onError: () => toast.error('Failed to revoke access'),
  })

  const selectedReport = reports[0] ?? null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 text-xl font-bold">Temporary Access</h2>
          <p className="text-slate-500 text-sm mt-0.5">{activeShares.length} active shares</p>
        </div>
        <button
          onClick={() => setShareDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Share
        </button>
      </div>

      {isLoading ? (
        <Loading text="Loading shares..." />
      ) : shares.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No Active Shares"
          description="You haven't created any temporary access links yet."
          action={{ label: 'Create Share', onClick: () => setShareDialogOpen(true) }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Patient</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Report</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Expires</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((s) => {
                const Icon = statusIcon[s.status] ?? CheckCircle
                return (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                    <td className="px-4 py-3 text-slate-600">{s.patient_name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{s.report_type ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {s.status === 'ACTIVE' ? (
                        <span className="text-teal-600 font-medium">{getTimeRemaining(s.expires_at)}</span>
                      ) : formatDateTime(s.expires_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[s.status]}`}>
                        <Icon className="w-3 h-3" />
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.status === 'ACTIVE' && (
                          <>
                            <button onClick={() => setQrShare(s)} className="text-teal-600 hover:text-teal-700 text-xs font-medium transition-colors">QR</button>
                            <button onClick={() => setRevokeTarget(s)} className="text-red-600 hover:text-red-700 text-xs font-medium transition-colors">Revoke</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ShareDialog
        open={shareDialogOpen}
        report={selectedReport}
        onClose={() => setShareDialogOpen(false)}
        onShare={createShare}
        loading={creating}
      />

      {qrShare && (
        <QRCodeDisplay
          share={qrShare}
          onClose={() => setQrShare(null)}
          onRevoke={() => setRevokeTarget(qrShare)}
          revoking={revoking}
        />
      )}

      <ConfirmDialog
        open={!!revokeTarget}
        title="Revoke Access?"
        description="This will immediately prevent the recipient from accessing this medical report."
        confirmLabel="Revoke Access"
        danger
        loading={revoking}
        onConfirm={() => revokeTarget && revokeShare(revokeTarget.id)}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  )
}
