import { useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SHARE_DURATIONS } from '@/types/sharing'
import type { CreateSharePayload } from '@/types/sharing'
import type { MedicalReport } from '@/types/report'

const schema = z.object({
  duration_minutes: z.number().min(1),
  can_view: z.boolean(),
  can_download: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface ShareDialogProps {
  open: boolean
  report: MedicalReport | null
  onClose: () => void
  onShare: (payload: CreateSharePayload) => Promise<void> | void
  loading?: boolean
}

export function ShareDialog({ open, report, onClose, onShare, loading }: ShareDialogProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { duration_minutes: 30, can_view: true, can_download: false },
  })

  if (!open || !report) return null

  async function onSubmit(values: FormValues) {
    await onShare({
      report_id: report!.id,
      duration_minutes: values.duration_minutes,
      can_view: values.can_view,
      can_download: values.can_download,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <h2 id="share-title" className="text-white font-semibold text-lg mb-1">Create Temporary Access</h2>
        <p className="text-slate-400 text-sm mb-6">
          Share <span className="text-white font-medium">{report.report_type}</span> with time-limited access
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="duration_minutes" className="block text-sm font-medium text-slate-300 mb-2">
              Access Duration
            </label>
            <select
              id="duration_minutes"
              {...register('duration_minutes', { valueAsNumber: true })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500"
            >
              {SHARE_DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            {errors.duration_minutes && <p className="text-red-400 text-xs mt-1">{errors.duration_minutes.message}</p>}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">Permissions</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('can_view')} className="w-4 h-4 accent-sky-500" />
                <span className="text-sm text-slate-300">View report</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('can_download')} className="w-4 h-4 accent-sky-500" />
                <span className="text-sm text-slate-300">Download report</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Create Share
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
