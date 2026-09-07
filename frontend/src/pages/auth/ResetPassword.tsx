import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, CheckCircle } from 'lucide-react'
import { authService } from '@/services/auth.service'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

export default function ResetPassword() {
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      await authService.updatePassword(values.password)
      setDone(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-900/20 via-slate-900 to-slate-900 pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-white text-xl font-bold">CryptoHealth</h1>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-8 backdrop-blur-sm">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-white font-semibold text-lg">Password updated!</h2>
              <p className="text-slate-400 text-sm mt-1">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <h2 className="text-white text-xl font-semibold mb-1">Reset Password</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your new password below.</p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
                )}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                  <input
                    id="password"
                    type="password"
                    {...register('password')}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Update Password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
