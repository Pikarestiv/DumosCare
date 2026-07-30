import { NavLink } from 'react-router-dom'
import { Activity, AlertTriangle, LogOut, Users } from 'lucide-react'
import { useLogout } from '../lib/hooks'
import { useUiStore } from '../store/uiStore'

export default function Layout({ children }) {
  const logout = useLogout()
  const user = useUiStore((s) => s.user)

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-50 text-emerald-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <Activity className="h-4.5 w-4.5 text-white" size={18} />
          </div>
          <span className="text-lg font-semibold text-slate-900">Pingura</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <NavLink to="/" end className={navItemClass}>
            <Users size={17} />
            Patients
          </NavLink>
          <NavLink to="/flagged" className={navItemClass}>
            <AlertTriangle size={17} />
            Flagged check-ins
          </NavLink>
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 px-2 text-xs text-slate-500 truncate">{user?.email}</div>
          <button
            onClick={() => logout.mutate()}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
