import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { useCurrentUser } from './lib/hooks'
import { useUiStore } from './store/uiStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import PatientListPage from './pages/PatientListPage'
import PatientDetailPage from './pages/PatientDetailPage'
import FlaggedCheckInsPage from './pages/FlaggedCheckInsPage'
import ActivityFeedPage from './pages/ActivityFeedPage'
import RemindersPage from './pages/RemindersPage'
import ReportsPage from './pages/ReportsPage'
import OverviewPage from './pages/OverviewPage'

export default function App() {
  const { data: user, isLoading } = useCurrentUser()
  const setUser = useUiStore((s) => s.setUser)

  useEffect(() => {
    setUser(user ?? null)
  }, [user, setUser])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading Dumos Care...
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PatientListPage />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/flagged" element={<FlaggedCheckInsPage />} />
        <Route path="/activity" element={<ActivityFeedPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
