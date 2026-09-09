import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Check,
  X,
} from 'lucide-react'
import { authService } from '@/services/auth.service'

/* ── Password strength helpers ─────────────────────────── */

interface PasswordRule {
  label: string
  test: (v: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'Contains uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'Contains lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'Contains a number', test: (v) => /\d/.test(v) },
  { label: 'Contains special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

function getStrengthLevel(password: string): { score: number; label: string; color: string } {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length
  if (passed <= 1) return { score: passed, label: 'Weak', color: 'bg-red-500' }
  if (passed <= 2) return { score: passed, label: 'Fair', color: 'bg-orange-500' }
  if (passed <= 3) return { score: passed, label: 'Good', color: 'bg-amber-500' }
  if (passed <= 4) return { score: passed, label: 'Strong', color: 'bg-emerald-500' }
  return { score: passed, label: 'Very Strong', color: 'bg-emerald-400' }
}

/* ── Role config ───────────────────────────────────────── */

const ROLE_OPTIONS = [
  {
    value: 'patient' as const,
    label: 'Patient',
    description: 'Access and manage your medical records',
    icon: '👤',
  },
  {
    value: 'doctor' as const,
    label: 'Doctor',
    description: 'View authorized patient reports',
    icon: '🩺',
  },
  {
    value: 'hospital' as const,
    label: 'Hospital',
    description: 'Upload and issue medical reports',
    icon: '🏥',
  },
]

/* ── Validation schema ─────────────────────────────────── */

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters')
      .regex(/^[a-zA-Z\s.''-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^[+]?[\d\s()-]{7,20}$/, 'Please enter a valid phone number')
      .or(z.literal(''))
      .optional(),
    role: z.enum(['patient', 'doctor', 'hospital'], {
      errorMap: () => ({ message: 'Please select an account type' }),
    }),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'You must acknowledge the terms' }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

/* ── Component ─────────────────────────────────────────── */

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'patient',
      phone: '',
      terms: false as unknown as true,
    },
  })

  const watchedPassword = watch('password', '')
  const watchedRole = watch('role')

  const strength = useMemo(() => getStrengthLevel(watchedPassword || ''), [watchedPassword])

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null)
    try {
      await authService.signUp(
        values.email,
        values.password,
        values.fullName,
        values.role,
        values.phone || undefined,
      )
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err
      ) {
        const axiosErr = err as { response?: { status?: number; data?: { error?: { message?: string } } } }
        if (axiosErr.response?.status === 429) {
          setServerError('Too many requests. Please wait a moment and try again.')
          return
        }
        if (axiosErr.response?.status === 409) {
          setServerError('An account with this email already exists. Please sign in instead.')
          return
        }
        const serverMessage = axiosErr.response?.data?.error?.message
        if (serverMessage) {
          setServerError(serverMessage)
          return
        }
      }
      setServerError(
        err instanceof Error ? err.message : 'Registration failed. Please try again.',
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 py-8">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/20 via-slate-900 to-slate-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/25 transition-transform duration-300 hover:scale-105">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">CryptoHealth</h1>
          <p className="text-slate-400 text-xs mt-0.5">Secure Medical Records Platform</p>
        </div>

        {/* Registration card */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-8 backdrop-blur-sm shadow-xl shadow-black/20">
          <h2 className="text-white text-xl font-semibold mb-1">Create Your Account</h2>
          <p className="text-slate-400 text-sm mb-6">
            Join CryptoHealth for secure, patient-controlled medical records
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Server error */}
            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-[fadeIn_0.2s_ease-out]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Account type</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all duration-200 text-center ${
                      watchedRole === opt.value
                        ? 'border-sky-500 bg-sky-500/10 shadow-sm shadow-sky-500/10'
                        : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
                    }`}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('role')}
                      className="sr-only"
                    />
                    <span className="text-lg">{opt.icon}</span>
                    <span
                      className={`text-xs font-medium ${
                        watchedRole === opt.value ? 'text-sky-400' : 'text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      {opt.description}
                    </span>
                  </label>
                ))}
              </div>
              {errors.role && (
                <p className="text-red-400 text-xs mt-1.5" role="alert">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="register-fullName" className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-fullName"
                  type="text"
                  autoComplete="name"
                  {...register('fullName')}
                  placeholder="Enter your full name"
                  aria-invalid={errors.fullName ? 'true' : 'false'}
                  aria-describedby={errors.fullName ? 'register-fullName-error' : undefined}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 focus:bg-slate-900 transition-all duration-200"
                />
              </div>
              {errors.fullName && (
                <p id="register-fullName-error" className="text-red-400 text-xs mt-1" role="alert">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'register-email-error' : undefined}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 focus:bg-slate-900 transition-all duration-200"
                />
              </div>
              {errors.email && (
                <p id="register-email-error" className="text-red-400 text-xs mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password')}
                  placeholder="Create a strong password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby="password-strength"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-12 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 focus:bg-slate-900 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1" role="alert">
                  {errors.password.message}
                </p>
              )}

              {/* Password strength indicator */}
              {watchedPassword && (
                <div id="password-strength" className="mt-2.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < strength.score ? strength.color : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 min-w-[70px] text-right">
                      {strength.label}
                    </span>
                  </div>
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {PASSWORD_RULES.map((rule) => {
                      const passes = rule.test(watchedPassword)
                      return (
                        <li
                          key={rule.label}
                          className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                            passes ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {passes ? (
                            <Check className="w-3 h-3 shrink-0" />
                          ) : (
                            <X className="w-3 h-3 shrink-0" />
                          )}
                          {rule.label}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  placeholder="Re-enter your password"
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-12 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 focus:bg-slate-900 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-0.5"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="register-confirm-error" className="text-red-400 text-xs mt-1" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Phone (optional) */}
            <div>
              <label htmlFor="register-phone" className="block text-sm font-medium text-slate-300 mb-1.5">
                Phone number <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-phone"
                  type="tel"
                  autoComplete="tel"
                  {...register('phone')}
                  placeholder="+91 98765 43210"
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 focus:bg-slate-900 transition-all duration-200"
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1" role="alert">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Terms acknowledgment */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="register-terms"
                type="checkbox"
                {...register('terms')}
                className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900/60 text-sky-500 focus:ring-sky-500/40 focus:ring-offset-0 cursor-pointer accent-sky-500"
              />
              <label htmlFor="register-terms" className="text-xs text-slate-400 cursor-pointer leading-relaxed">
                I acknowledge that my medical data will be encrypted and stored securely according to
                CryptoHealth's security architecture
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-400 text-xs -mt-2" role="alert">
                {errors.terms.message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isSubmitting ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          {/* Sign in link */}
          <div className="mt-5 pt-4 border-t border-slate-700/60 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-xs">
            Protected by end-to-end encryption
          </p>
          <p className="text-slate-700 text-xs mt-1">
            © {new Date().getFullYear()} CryptoHealth — Secure Medical Records
          </p>
        </div>
      </div>
    </div>
  )
}
