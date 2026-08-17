import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Plus, UserCheck, Users } from 'lucide-react'
import { useDashboardSummary, usePatients } from '../lib/hooks'
import EnrollPatientModal from '../components/EnrollPatientModal'

const PROGRAM_LABELS = {
  blood_pressure: 'Blood pressure',
  medication_adherence: 'Medication',
  wound_care: 'Wound care',
  general_checkin: 'Check-in',
}

function StatTile({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={16} className={tone} />
        <span className="text-sm font-medium">{label}</span>
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
          <p className="text-sm text-slate-500">Everyone enrolled in a monitoring program.</p>
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
          <StatTile icon={UserCheck} label="Active patients" value={summary.active_patients} tone="text-emerald-600" />
          <StatTile icon={AlertTriangle} label="Flagged today" value={summary.flagged_check_ins_today} tone="text-amber-600" />
          <StatTile icon={Users} label="Overdue reminders" value={summary.overdue_reminders} tone="text-sky-600" />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Active programs</th>
              <th className="px-4 py-3 font-medium">Last check-in</th>
              <th className="px-4 py-3 font-medium">Flagged</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Loading patients...
                </td>
              </tr>
            )}
            {patients?.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/patients/${p.id}`)}
                className="cursor-pointer hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900">{p.name}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.active_programs.length === 0 && <span className="text-slate-400">None</span>}
                    {p.active_programs.map((type) => (
                      <span
                        key={type}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      >
                        {PROGRAM_LABELS[type] || type}
                      </span>
                    ))}
                  </div>
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
