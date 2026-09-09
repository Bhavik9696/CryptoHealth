import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { authService } from '@/services/auth.service'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setAuthError(null)
    try {
      await authService.signIn(values.email, values.password)
      navigate('/dashboard')
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-900/20 via-slate-900 to-slate-900 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/25">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">CryptoHealth</h1>
          <p className="text-slate-400 text-sm mt-1">Secure Medical Records Portal</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-white text-xl font-semibold mb-1">Welcome Back</h2>
          <p className="text-slate-400 text-sm mb-6">Sign in to your hospital or doctor account</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Error */}
            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {authError}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                placeholder="doctor@hospital.com"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:bg-slate-900 transition-colors"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:bg-slate-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 text-sm shadow-lg shadow-sky-500/20"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <p className="text-xs text-slate-400 text-center mb-3 font-medium">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  authService.signIn('doctor@cryptohealth.example.com', 'password123').then(() => navigate('/dashboard'))
                }}
                className="px-2.5 py-2 bg-slate-700/50 hover:bg-sky-500/20 hover:border-sky-500/40 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-all text-center"
              >
                🩺 Doctor
              </button>
              <button
                type="button"
                onClick={() => {
                  authService.signIn('hospital@cryptohealth.example.com', 'password123').then(() => navigate('/dashboard'))
                }}
                className="px-2.5 py-2 bg-slate-700/50 hover:bg-sky-500/20 hover:border-sky-500/40 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-all text-center"
              >
                🏥 Hospital
              </button>
              <button
                type="button"
                onClick={() => {
                  authService.signIn('patient@cryptohealth.example.com', 'password123').then(() => navigate('/dashboard'))
                }}
                className="px-2.5 py-2 bg-slate-700/50 hover:bg-sky-500/20 hover:border-sky-500/40 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-all text-center"
              >
                👤 Patient
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <Link
              to="/forgot-password"
              className="text-sky-400 hover:text-sky-300 text-sm transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © {new Date().getFullYear()} CryptoHealth — Secure Medical Records
        </p>
      </div>
    </div>
  )
}
