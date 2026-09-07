import { useNavigate } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-sky-400 font-bold text-8xl mb-4">404</p>
        <h1 className="text-white text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/patients')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            Search Patients
          </button>
        </div>
      </div>
    </div>
  )
}
