import { LucideIcon, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: 'blue' | 'emerald' | 'amber' | 'purple'
  subtitle?: string
  trend?: number
}

const colorMap = {
  blue: 'text-blue-600 bg-blue-50 border-blue-100',
  emerald: 'text-teal-600 bg-teal-50 border-teal-100',
  amber: 'text-amber-600 bg-amber-50 border-amber-100',
  purple: 'text-purple-600 bg-purple-50 border-purple-100',
}

export function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-11 h-11 rounded-xl border flex items-center justify-center', colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trend >= 0 ? 'text-teal-600' : 'text-red-600')}>
            <TrendingUp className="w-3.5 h-3.5" />
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-slate-600 text-sm font-medium">{title}</p>
      {subtitle && <p className="text-slate-400 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}
