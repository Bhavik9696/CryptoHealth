import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ShieldCheck, Search, CheckCircle, XCircle, Clock } from 'lucide-react'
import { verificationService } from '@/services/verification.service'
import type { VerificationResult } from '@/types/report'

export default function Verification() {
  const [reportId, setReportId] = useState('')
  const [result, setResult] = useState<VerificationResult | null>(null)

  const { mutate: verify, isPending } = useMutation({
    mutationFn: () => verificationService.verifyReport(reportId.trim()),
    onSuccess: (data) => setResult(data),
    onError: () => setResult(null),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reportId.trim()) return
    verify()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-white text-xl font-bold">Verify Medical Report</h2>
        <p className="text-slate-400 text-sm mt-0.5">Enter a report ID to verify its cryptographic integrity</p>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="report-id" className="block text-sm font-medium text-slate-300 mb-1.5">Report ID</label>
            <input
              id="report-id"
              type="text"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              placeholder="Enter report ID..."
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !reportId.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            {isPending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Search className="w-4 h-4" />
            }
            {isPending ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>

      {result && (
        <div className={`border rounded-xl p-6 space-y-4 ${result.signature_valid ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-red-500/5 border-red-500/30'}`}>
          <div className="flex items-center gap-3">
            {result.signature_valid ? (
              <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400 shrink-0" />
            )}
            <div>
              <h3 className={`font-bold text-lg ${result.signature_valid ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.signature_valid ? '✓ VERIFIED' : '⚠ VERIFICATION FAILED'}
              </h3>
              <p className="text-slate-400 text-sm">
                {result.signature_valid
                  ? 'This report passed cryptographic verification.'
                  : 'The report could not be verified. The signature may be invalid or the report may have been tampered with.'
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Signature</p>
              <div className="flex items-center gap-1.5">
                {result.signature_valid ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                <span className="text-sm text-slate-300">{result.signature_valid ? 'Valid' : 'Invalid'}</span>
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Hash</p>
              <div className="flex items-center gap-1.5">
                {result.hash_valid ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                <span className="text-sm text-slate-300">{result.hash_valid ? 'Verified' : 'Mismatch'}</span>
              </div>
            </div>
            {result.hospital && (
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Hospital</p>
                <p className="text-sm text-slate-300">{result.hospital}</p>
              </div>
            )}
            {result.doctor && (
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">Doctor</p>
                <p className="text-sm text-slate-300">{result.doctor}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info card */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex gap-4">
        <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-white text-sm font-medium">How verification works</p>
          <p className="text-slate-400 text-xs mt-1">
            CryptoHealth uses cryptographic digital signatures to verify the authenticity and integrity of medical reports. 
            Verification checks the report's hash and the hospital's digital signature.
          </p>
        </div>
      </div>
    </div>
  )
}
