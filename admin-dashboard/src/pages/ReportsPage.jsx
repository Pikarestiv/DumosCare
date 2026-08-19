import { FileBarChart } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Scheduled and exportable reports for your practice.</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <FileBarChart size={22} />
        </div>
        <h2 className="text-sm font-semibold text-slate-900">Reports are coming soon</h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Weekly adherence summaries, patient-level PDF reports, and scheduled email digests are on the roadmap.
        </p>
      </div>
    </div>
  )
}
