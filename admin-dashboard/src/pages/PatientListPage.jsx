import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Download, Plus, Search, UserCheck, Users } from 'lucide-react'
import { useDashboardSummary, usePatients } from '../lib/hooks'
import EnrollPatientModal from '../components/EnrollPatientModal'
import { avatarColor, initials, PROGRAM_META, programMeta } from '../lib/programMeta'
import Sparkline from '../components/Sparkline'
import { exportPatientsCsv } from '../lib/exportCsv'
import { formatDate } from '../lib/dateFormat'
import Skeleton from '../components/Skeleton'

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
  const [search, setSearch] = useState('')
  const [programFilter, setProgramFilter] = useState(null)
  const [flaggedOnly, setFlaggedOnly] = useState(false)

  const filteredPatients = useMemo(() => {
    if (!patients) return patients
    const term = search.trim().toLowerCase()
    return patients.filter((p) => {
      if (term && !p.name.toLowerCase().includes(term) && !p.phone.toLowerCase().includes(term)) return false
      if (programFilter && !p.active_programs.includes(programFilter)) return false
      if (flaggedOnly && p.flagged_count === 0) return false
      return true
    })
  }, [patients, search, programFilter, flaggedOnly])

  const hasActiveFilters = search.trim() !== '' || programFilter !== null || flaggedOnly

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500">Everyone enrolled in a monitoring program, patients needing attention first.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportPatientsCsv(filteredPatients || [])}
            disabled={!filteredPatients?.length}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={() => setShowEnroll(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={16} />
            Enroll patient
          </button>
        </div>
      </div>

      {summary ? (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <StatTile icon={UserCheck} label="Active patients" value={summary.active_patients} chip="bg-emerald-50 text-emerald-600" />
          <StatTile icon={AlertTriangle} label="Flagged today" value={summary.flagged_check_ins_today} chip="bg-amber-50 text-amber-600" />
          <StatTile icon={Users} label="Overdue reminders" value={summary.overdue_reminders} chip="bg-sky-50 text-sky-600" />
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="mt-3 h-7 w-12" />
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-64 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={() => setProgramFilter(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            programFilter === null ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All programs
        </button>
        {Object.entries(PROGRAM_META).map(([type, meta]) => (
          <button
            key={type}
            onClick={() => setProgramFilter(programFilter === type ? null : type)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              programFilter === type ? meta.pill + ' ring-1 ring-inset ring-current' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {meta.shortLabel}
          </button>
        ))}
        <button
          onClick={() => setFlaggedOnly((v) => !v)}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
            flaggedOnly ? 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <AlertTriangle size={12} />
          Flagged only
        </button>
      </div>

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
            {isLoading &&
              [0, 1, 2, 3].map((i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-6 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-8 rounded-full" />
                  </td>
                </tr>
              ))}
            {!isLoading && filteredPatients?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  {hasActiveFilters ? 'No patients match your filters.' : 'No patients enrolled yet.'}
                </td>
              </tr>
            )}
            {filteredPatients?.map((p) => (
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
                  {p.last_check_in_at ? formatDate(p.last_check_in_at) : '—'}
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
