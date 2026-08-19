export default function Sparkline({ values, barClassName = 'bg-slate-300', activeBarClassName = 'bg-emerald-500' }) {
  const max = Math.max(1, ...values)

  return (
    <div className="flex h-6 items-end gap-[3px]">
      {values.map((v, i) => (
        <div
          key={i}
          className={`w-1 rounded-sm ${v > 0 ? activeBarClassName : barClassName}`}
          style={{ height: `${Math.max(2, (v / max) * 24)}px` }}
        />
      ))}
    </div>
  )
}
