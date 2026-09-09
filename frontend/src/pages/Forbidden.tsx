import { useNavigate } from 'react-router-dom'
import { ShieldOff, Home } from 'lucide-react'

export default function Forbidden() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
          <ShieldOff className="w-10 h-10 text-red-400" />
        </div>
        <p className="text-red-400 font-bold text-6xl mb-4">403</p>
        <h1 className="text-white text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-400 text-sm mb-8 max-w-sm">You don't have permission to access this page. Contact your administrator if you believe this is a mistake.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-sm font-medium transition-colors mx-auto"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
