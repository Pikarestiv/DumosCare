import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Plus, UserCheck, Users } from 'lucide-react'
import { useDashboardSummary, usePatients } from '../lib/hooks'
import EnrollPatientModal from '../components/EnrollPatientModal'
import { avatarColor, initials, programMeta } from '../lib/programMeta'
import Sparkline from '../components/Sparkline'

function StatTile({ icon: Icon, label, value, chip }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${chip}`}>
          <Icon size={16} />
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  )
}

export default function PatientListPage() {
  const navigate = useNavigate()
  const { data: patients, isLoading } = usePatients()
  const { data: summary } = useDashboardSummary()
  const [showEnroll, setShowEnroll] = useState(false)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500">Everyone enrolled in a monitoring program, patients needing attention first.</p>
        </div>
        <button
          onClick={() => setShowEnroll(true)}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={16} />
          Enroll patient
        </button>
      </div>

      {summary && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <StatTile icon={UserCheck} label="Active patients" value={summary.active_patients} chip="bg-emerald-50 text-emerald-600" />
          <StatTile icon={AlertTriangle} label="Flagged today" value={summary.flagged_check_ins_today} chip="bg-amber-50 text-amber-600" />
          <StatTile icon={Users} label="Overdue reminders" value={summary.overdue_reminders} chip="bg-sky-50 text-sky-600" />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Active programs</th>
              <th className="px-4 py-3 font-medium">Activity (14d)</th>
              <th className="px-4 py-3 font-medium">Last check-in</th>
              <th className="px-4 py-3 font-medium">Flagged</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Loading patients...
                </td>
              </tr>
            )}
            {patients?.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/patients/${p.id}`)}
                className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                  p.flagged_count > 0 ? 'border-l-2 border-l-red-400' : 'border-l-2 border-l-transparent'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(p.name)}`}
                    >
                      {initials(p.name)}
                    </div>
                    <span className="font-medium text-slate-900">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.active_programs.length === 0 && <span className="text-slate-400">None</span>}
                    {p.active_programs.map((type) => (
                      <span
                        key={type}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${programMeta(type).pill}`}
                      >
                        {programMeta(type).shortLabel}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {p.activity_sparkline?.some((v) => v > 0) ? (
                    <Sparkline
                      values={p.activity_sparkline}
                      activeBarClassName={p.flagged_count > 0 ? 'bg-red-400' : 'bg-emerald-500'}
                    />
                  ) : (
                    <span className="text-slate-300">No activity</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.last_check_in_at ? new Date(p.last_check_in_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  {p.flagged_count > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                      <AlertTriangle size={12} />
                      {p.flagged_count}
                    </span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEnroll && <EnrollPatientModal onClose={() => setShowEnroll(false)} />}
    </div>
  )
}
