import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, X, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import type { Share } from '@/types/sharing'
import { getTimeRemaining } from '@/lib/utils'

interface QRCodeDisplayProps {
  share: Share
  onRevoke: () => void
  onClose: () => void
  revoking?: boolean
}

export function QRCodeDisplay({ share, onRevoke, onClose, revoking }: QRCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(share.expires_at))

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeRemaining(share.expires_at)), 1000)
    return () => clearInterval(timer)
  }, [share.expires_at])

  const shareUrl = `${window.location.origin}/shared/${share.access_token ?? share.id}`

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-sm shadow-2xl text-center"
        role="dialog"
        aria-modal="true"
        aria-label="Temporary access QR code"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-white font-semibold text-lg mb-1">Temporary Access</h2>
        <p className="text-slate-400 text-sm mb-5">Scan QR code to access this report</p>

        <div className="flex justify-center mb-5">
          <div className="p-4 bg-white rounded-xl">
            <QRCodeSVG value={shareUrl} size={180} />
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-lg px-4 py-3 mb-5">
          <p className="text-slate-400 text-xs mb-1">Expires in</p>
          <p className={`text-2xl font-bold font-mono ${timeLeft === 'Expired' ? 'text-red-400' : 'text-sky-400'}`}>
            {timeLeft}
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </button>
          <button
            onClick={onRevoke}
            disabled={revoking}
            aria-label="Revoke temporary access"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {revoking
              ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              : <ShieldOff className="w-4 h-4" />
            }
            Revoke Access
          </button>
        </div>
      </div>
    </div>
  )
}
