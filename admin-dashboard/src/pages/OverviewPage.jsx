import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAnalytics } from '../lib/hooks'
import { programMeta } from '../lib/programMeta'
import Skeleton from '../components/Skeleton'

function OverviewSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Skeleton className="mb-3 h-4 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Skeleton className="mb-3 h-4 w-40" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function OverviewPage() {
  const { data, isLoading } = useAnalytics()

  if (isLoading || !data) {
    return <OverviewSkeleton />
  }

  const chartData = data.daily_check_ins.map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    'Check-ins': d.count - d.flagged,
    Flagged: d.flagged,
  }))

  const breakdownEntries = Object.entries(data.program_breakdown || {})
  const maxBreakdown = Math.max(1, ...breakdownEntries.map(([, count]) => count))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500">Practice-wide activity over the last 14 days.</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Check-ins (14d)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{data.total_check_ins_14d}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Flagged (14d)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{data.flagged_check_ins_14d}</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Daily check-in volume</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
            <Bar dataKey="Check-ins" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Flagged" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Active programs by type</h2>
        {breakdownEntries.length === 0 && <p className="text-sm text-slate-400">No active programs yet.</p>}
        <div className="space-y-3">
          {breakdownEntries.map(([type, count]) => {
            const meta = programMeta(type)
            const Icon = meta.icon
            return (
              <div key={type} className="flex items-center gap-3">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.chip}`}>
                  <Icon size={14} />
                </div>
                <span className="w-40 shrink-0 text-sm text-slate-700">{meta.label}</span>
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${(count / maxBreakdown) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm font-medium text-slate-900">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
