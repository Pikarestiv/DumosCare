import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useFlaggedCheckIns } from '../lib/hooks'
import { describeCheckIn } from '../lib/checkIns'
import { formatDateTime, timeAgo } from '../lib/dateFormat'
import { CardListSkeleton } from '../components/Skeleton'

export default function FlaggedCheckInsPage() {
  const { data, isLoading } = useFlaggedCheckIns()
  const checkIns = data?.data || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Flagged check-ins</h1>
        <p className="text-sm text-slate-500">Cross-patient triage view of anything out of range.</p>
      </div>

      {isLoading && <CardListSkeleton />}

      <div className="space-y-3">
        {!isLoading && checkIns.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
            Nothing flagged. All clear.
          </p>
        )}
        {checkIns.map((c) => (
          <div key={c.id} className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/60 p-4 shadow-sm">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Link
                  to={`/patients/${c.program.patient.id}`}
                  className="text-sm font-semibold text-slate-900 hover:text-emerald-700"
                >
                  {c.program.patient.name}
                </Link>
                <span className="text-xs text-slate-500" title={formatDateTime(c.created_at)}>
                  {timeAgo(c.created_at)}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{describeCheckIn(c)}</p>
              {c.flag_reason && <p className="mt-1 text-xs font-medium text-red-700">{c.flag_reason}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
