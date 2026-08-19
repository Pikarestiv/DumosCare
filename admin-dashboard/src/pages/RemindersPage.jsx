import { Link } from 'react-router-dom'
import { Bell, Clock } from 'lucide-react'
import { useReminders } from '../lib/hooks'
import { programMeta } from '../lib/programMeta'

const FREQUENCY_LABELS = {
  daily: 'Daily',
  twice_daily: 'Twice daily',
  weekly: 'Weekly',
}

export default function RemindersPage() {
  const { data: reminders, isLoading } = useReminders()

  const now = new Date()
  const overdue = reminders?.filter((r) => new Date(r.next_due_at) < now) || []
  const upcoming = reminders?.filter((r) => new Date(r.next_due_at) >= now) || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Reminders</h1>
        <p className="text-sm text-slate-500">Every scheduled reminder across all patients.</p>
      </div>

      {isLoading && <p className="text-sm text-slate-400">Loading...</p>}

      {!isLoading && reminders?.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
          No reminders scheduled yet.
        </p>
      )}

      {overdue.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-600">Overdue ({overdue.length})</h2>
          <div className="space-y-2">
            {overdue.map((r) => (
              <ReminderRow key={r.id} reminder={r} overdue />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Upcoming ({upcoming.length})</h2>
          <div className="space-y-2">
            {upcoming.map((r) => (
              <ReminderRow key={r.id} reminder={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ReminderRow({ reminder, overdue }) {
  const patient = reminder.program?.patient
  const meta = programMeta(reminder.program?.type)
  const Icon = meta.icon

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm ${
        overdue ? 'border-red-200 bg-red-50/60' : 'border-slate-200'
      }`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.chip}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          {patient ? (
            <Link to={`/patients/${patient.id}`} className="text-sm font-semibold text-slate-900 hover:text-emerald-700">
              {patient.name}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-slate-900">Unknown patient</span>
          )}
          <span className={`flex items-center gap-1 text-xs font-medium ${overdue ? 'text-red-600' : 'text-slate-500'}`}>
            <Clock size={12} />
            {new Date(reminder.next_due_at).toLocaleString()}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-700">{reminder.message_template}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
          <Bell size={11} />
          <span>{reminder.channel}</span>
          <span>&middot;</span>
          <span>{FREQUENCY_LABELS[reminder.frequency] || reminder.frequency}</span>
        </div>
      </div>
    </div>
  )
}
