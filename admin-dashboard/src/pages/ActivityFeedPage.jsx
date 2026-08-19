import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useCheckIns } from '../lib/hooks'
import { describeCheckIn } from '../lib/checkIns'
import { programMeta } from '../lib/programMeta'

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function ActivityFeedPage() {
  const { data, isLoading } = useCheckIns()
  const checkIns = data?.data || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Activity</h1>
        <p className="text-sm text-slate-500">Every check-in across all patients, most recent first.</p>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-slate-400">Loading...</p>}
        {!isLoading && checkIns.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
            No check-ins yet.
          </p>
        )}
        {checkIns.map((c) => {
          const meta = programMeta(c.program?.type)
          const Icon = meta.icon
          return (
            <div key={c.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.chip}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/patients/${c.program.patient.id}`}
                    className="text-sm font-semibold text-slate-900 hover:text-emerald-700"
                  >
                    {c.program.patient.name}
                  </Link>
                  <span className="text-xs text-slate-500" title={new Date(c.created_at).toLocaleString()}>
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700">{describeCheckIn(c)}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <span>via {c.source}</span>
                  {c.flagged && (
                    <span className="inline-flex items-center gap-1 font-medium text-red-600">
                      <AlertTriangle size={11} />
                      Flagged
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
