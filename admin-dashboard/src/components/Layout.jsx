import { NavLink } from 'react-router-dom'
import { Activity, AlertTriangle, Bell, FileBarChart, LayoutDashboard, LogOut, Radio, Users } from 'lucide-react'
import { useDashboardSummary, useLogout } from '../lib/hooks'
import { useUiStore } from '../store/uiStore'
import { avatarColor, initials } from '../lib/programMeta'

export default function Layout({ children }) {
  const logout = useLogout()
  const user = useUiStore((s) => s.user)
  const { data: summary } = useDashboardSummary()

  const navItemClass = ({ isActive }) =>
    `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-50 text-emerald-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  const countBadgeClass = ({ isActive }) =>
    `rounded-full px-1.5 py-0.5 text-xs font-semibold ${
      isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
    }`

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <Activity className="h-4.5 w-4.5 text-white" size={18} />
          </div>
          <div>
            <span className="block text-lg font-semibold leading-tight text-slate-900">Dumos Care</span>
            <span className="block text-xs text-slate-400">Provider dashboard</span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <span className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Menu</span>
          <NavLink to="/overview" className={navItemClass}>
            <span className="flex items-center gap-2.5">
              <LayoutDashboard size={17} />
              Overview
            </span>
          </NavLink>
          <NavLink to="/" end className={navItemClass}>
            {({ isActive }) => (
              <>
                <span className="flex items-center gap-2.5">
                  <Users size={17} />
                  Patients
                </span>
                {summary?.active_patients > 0 && (
                  <span className={countBadgeClass({ isActive })}>{summary.active_patients}</span>
                )}
              </>
            )}
          </NavLink>
          <NavLink to="/activity" className={navItemClass}>
            <span className="flex items-center gap-2.5">
              <Radio size={17} />
              Activity
            </span>
          </NavLink>
          <NavLink to="/flagged" className={navItemClass}>
            <span className="flex items-center gap-2.5">
              <AlertTriangle size={17} />
              Flagged check-ins
            </span>
            {summary?.flagged_check_ins_today > 0 && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">
                {summary.flagged_check_ins_today}
              </span>
            )}
          </NavLink>
          <NavLink to="/reminders" className={navItemClass}>
            {({ isActive }) => (
              <>
                <span className="flex items-center gap-2.5">
                  <Bell size={17} />
                  Reminders
                </span>
                {summary?.overdue_reminders > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                      isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {summary.overdue_reminders}
                  </span>
                )}
              </>
            )}
          </NavLink>
          <NavLink to="/reports" className={navItemClass}>
            <span className="flex items-center gap-2.5">
              <FileBarChart size={17} />
              Reports
            </span>
          </NavLink>
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(user?.email || '')}`}
            >
              {initials(user?.name || user?.email)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-900">{user?.name || 'Provider'}</div>
              <div className="truncate text-xs text-slate-400">{user?.email}</div>
            </div>
          </div>
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
