export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
}

export function CardListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="mt-2 h-3.5 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
