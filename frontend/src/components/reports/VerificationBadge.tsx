import { CheckCircle, Clock, XCircle, MinusCircle } from 'lucide-react'
import type { ReportStatus } from '@/types/report'
import { cn } from '@/lib/utils'

interface VerificationBadgeProps {
  status: ReportStatus
  showText?: boolean
  size?: 'sm' | 'md'
}

const config: Record<ReportStatus, { icon: React.ElementType; label: string; classes: string }> = {
  VERIFIED: { icon: CheckCircle, label: 'Verified', classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  PENDING: { icon: Clock, label: 'Pending', classes: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  INVALID: { icon: XCircle, label: 'Invalid', classes: 'text-red-400 bg-red-500/10 border-red-500/30' },
  REVOKED: { icon: MinusCircle, label: 'Revoked', classes: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
}

export function VerificationBadge({ status, showText = true, size = 'md' }: VerificationBadgeProps) {
  const { icon: Icon, label, classes } = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border rounded-full font-medium',
        classes,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
      aria-label={`Status: ${label}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {showText && label}
    </span>
  )
}
