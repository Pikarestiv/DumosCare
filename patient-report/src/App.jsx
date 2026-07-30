import { Route, Routes } from 'react-router-dom'
import ReportPage from './pages/ReportPage'

export default function App() {
  return (
    <Routes>
      <Route path="/report/:token" element={<ReportPage />} />
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center px-4 text-center text-slate-500">
            Please use the link sent to you to view your check-in form.
          </div>
        }
      />
    </Routes>
  )
}
