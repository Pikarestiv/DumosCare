import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const SYSTOLIC_COLOR = '#2a78d6'
const DIASTOLIC_COLOR = '#1baf7a'

export default function BpTrendChart({ checkIns, config }) {
  const data = checkIns
    .filter((c) => c.structured_data?.systolic != null)
    .slice()
    .reverse()
    .map((c) => ({
      date: new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      systolic: c.structured_data.systolic,
      diastolic: c.structured_data.diastolic,
    }))

  if (data.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
        No blood pressure readings yet.
      </p>
    )
  }

  const sysHigh = config?.target_systolic_high ?? 140
  const diaHigh = config?.target_diastolic_high ?? 90

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="systolicFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SYSTOLIC_COLOR} stopOpacity={0.18} />
              <stop offset="95%" stopColor={SYSTOLIC_COLOR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="diastolicFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={DIASTOLIC_COLOR} stopOpacity={0.18} />
              <stop offset="95%" stopColor={DIASTOLIC_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[40, 'dataMax + 10']} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
            formatter={(value, name) => [`${value} mmHg`, name === 'systolic' ? 'Systolic' : 'Diastolic']}
          />
          <Legend
            iconType="plainline"
            formatter={(value) => (value === 'systolic' ? 'Systolic' : 'Diastolic')}
            wrapperStyle={{ fontSize: 12, color: '#475569' }}
          />
          <ReferenceLine y={sysHigh} stroke={SYSTOLIC_COLOR} strokeDasharray="4 4" strokeOpacity={0.4} />
          <ReferenceLine y={diaHigh} stroke={DIASTOLIC_COLOR} strokeDasharray="4 4" strokeOpacity={0.4} />
          <Area
            type="monotone"
            dataKey="systolic"
            stroke={SYSTOLIC_COLOR}
            strokeWidth={2}
            fill="url(#systolicFill)"
            dot={{ r: 3 }}
          />
          <Area
            type="monotone"
            dataKey="diastolic"
            stroke={DIASTOLIC_COLOR}
            strokeWidth={2}
            fill="url(#diastolicFill)"
            dot={{ r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
