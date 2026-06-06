import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import ProtectedRoute from './components/common/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import HistoryPage from './pages/HistoryPage'
import RoleSelector from './pages/RoleSelector'
import InterviewRoom from './pages/InterviewRoom'
import ReportPage from './pages/ReportPage'
import ReportsPage from './pages/ReportsPage'
import MotionTestPage from './pages/MotionTestPage'
import AvatarPlayground from './pages/AvatarPlayground'
import NotFound from './components/common/NotFound'

function AuthRedirect() {
  const { isAuthenticated } = useAuth0()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/') navigate('/dashboard')
  }, [isAuthenticated, location.pathname])

  return null
}

function LandingOrLoader() {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Noise overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Spinner & Logo/Text */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center w-20 h-20">
            {/* Spinning/pulsing elements */}
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.8s' }} />
            
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center backdrop-blur-sm border border-emerald-500/20">
              <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-emerald-400 font-medium tracking-wider text-sm uppercase">Preparing Dashboard</h2>
            <p className="text-xs text-[#8a9e8e]/60">Verifying session details...</p>
          </div>
        </div>
      </div>
    )
  }

  return <LandingPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthRedirect />
      <Routes>
        <Route path="/" element={<LandingOrLoader />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/select-role" element={<ProtectedRoute><RoleSelector /></ProtectedRoute>} />
        <Route path="/interview/:sessionId" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
        <Route path="/report/:sessionId" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
        <Route path="/share/:shareToken" element={<ReportPage shared />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/test-motion" element={<MotionTestPage />} />
        <Route path="/test-avatar" element={<AvatarPlayground />} />
      </Routes>
    </BrowserRouter>
  )
}
