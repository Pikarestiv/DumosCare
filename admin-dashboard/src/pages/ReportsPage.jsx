import { AlertTriangle, Bell, Download, FileText, Users } from 'lucide-react'
import { usePatients } from '../lib/hooks'
import { exportPatientsCsv } from '../lib/exportCsv'

const REPORTS = [
  {
    key: 'patient-roster',
    icon: Users,
    chip: 'bg-emerald-50 text-emerald-600',
    title: 'Patient roster',
    description: 'Every enrolled patient with active programs, last check-in, and flagged count. Exports as CSV.',
    available: true,
  },
  {
    key: 'adherence-summary',
    icon: FileText,
    chip: 'bg-violet-50 text-violet-600',
    title: 'Weekly adherence summary',
    description: 'PDF summary of medication adherence and check-in consistency per patient, sent weekly.',
    available: false,
  },
  {
    key: 'flagged-summary',
    icon: AlertTriangle,
    chip: 'bg-amber-50 text-amber-600',
    title: 'Flagged check-ins summary',
    description: 'A rolled-up report of every out-of-range reading over a chosen date range.',
    available: false,
  },
  {
    key: 'reminder-compliance',
    icon: Bell,
    chip: 'bg-sky-50 text-sky-600',
    title: 'Reminder compliance',
    description: 'How consistently patients respond to scheduled reminders, broken down by channel.',
    available: false,
  },
]

export default function ReportsPage() {
  const { data: patients } = usePatients()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Generate reports for your practice.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {REPORTS.map((report) => {
          const Icon = report.icon
          return (
            <div key={report.key} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${report.chip}`}>
                  <Icon size={18} />
                </div>
                {!report.available && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    Coming soon
                  </span>
                )}
              </div>
              <h2 className="text-sm font-semibold text-slate-900">{report.title}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-500">{report.description}</p>
              {report.available ? (
                <button
                  onClick={() => exportPatientsCsv(patients || [])}
                  disabled={!patients?.length}
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Download size={15} />
                  Generate CSV
                </button>
              ) : (
                <button
                  disabled
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-400"
                >
                  <Download size={15} />
                  Generate
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
