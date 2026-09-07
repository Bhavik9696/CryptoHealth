interface LoadingProps {
  text?: string
  fullPage?: boolean
}

export function Loading({ text = 'Loading...', fullPage = false }: LoadingProps) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">{text}</p>
    </div>
  )

  if (fullPage) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        {inner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-16">
      {inner}
    </div>
  )
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-800 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 animate-pulse space-y-3">
      <div className="h-4 bg-slate-700 rounded w-1/3" />
      <div className="h-8 bg-slate-700 rounded w-1/2" />
      <div className="h-3 bg-slate-700 rounded w-2/3" />
    </div>
  )
}
