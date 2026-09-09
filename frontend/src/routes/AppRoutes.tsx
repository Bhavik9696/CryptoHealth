import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

// Lazy-loaded pages
const Login = lazy(() => import('@/pages/auth/Login'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Patients = lazy(() => import('@/pages/Patients'))
const PatientDetails = lazy(() => import('@/pages/PatientDetails'))
const Reports = lazy(() => import('@/pages/Reports'))
const ReportDetails = lazy(() => import('@/pages/ReportDetails'))
const UploadReport = lazy(() => import('@/pages/UploadReport'))
const Verification = lazy(() => import('@/pages/Verification'))
const Sharing = lazy(() => import('@/pages/Sharing'))
const AccessLogs = lazy(() => import('@/pages/AccessLogs'))
const Profile = lazy(() => import('@/pages/Profile'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Forbidden = lazy(() => import('@/pages/Forbidden'))

const PageLoader = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/403" element={<Forbidden />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:patientId" element={<PatientDetails />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/upload" element={<UploadReport />} />
          <Route path="reports/:reportId" element={<ReportDetails />} />
          <Route path="verification" element={<Verification />} />
          <Route path="sharing" element={<Sharing />} />
          <Route path="access-logs" element={<AccessLogs />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
