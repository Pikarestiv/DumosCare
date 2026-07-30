import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Copy, Pause, Play, Plus } from 'lucide-react'
import { usePatient, useCreateProgram, useUpdateProgram } from '../lib/hooks'
import BpTrendChart from '../components/BpTrendChart'
import ReminderForm from '../components/ReminderForm'

const PROGRAM_LABELS = {
  blood_pressure: 'Blood pressure',
  medication_adherence: 'Medication adherence',
  wound_care: 'Wound care',
  general_checkin: 'General check-in',
}

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8123'
const REPORT_URL = import.meta.env.VITE_PATIENT_REPORT_URL || 'http://localhost:5174'

function describeCheckIn(checkIn) {
  const d = checkIn.structured_data || {}
  if ('systolic' in d) return `BP ${d.systolic}/${d.diastolic} mmHg`
  if ('taken' in d) return d.taken ? 'Medication taken' : 'Medication missed'
  if (d.note) return d.note
  if (d.caption) return d.caption
  return 'Check-in received'
}

function ProgramSection({ patient, program }) {
  const updateProgram = useUpdateProgram(patient.id)
  const checkIns = program.check_ins || []

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{PROGRAM_LABELS[program.type] || program.type}</h3>
          {program.type === 'medication_adherence' && program.config?.medication && (
            <p className="text-xs text-slate-500">{program.config.medication}</p>
          )}
          {program.type === 'wound_care' && program.config?.site && (
            <p className="text-xs text-slate-500">{program.config.site}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              program.status === 'active'
                ? 'bg-emerald-50 text-emerald-700'
                : program.status === 'paused'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            {program.status}
          </span>
          {program.status === 'active' ? (
            <button
              onClick={() => updateProgram.mutate({ id: program.id, status: 'paused' })}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="Pause program"
            >
              <Pause size={15} />
            </button>
          ) : (
            <button
              onClick={() => updateProgram.mutate({ id: program.id, status: 'active' })}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="Resume program"
            >
              <Play size={15} />
            </button>
          )}
        </div>
      </div>

      {program.type === 'blood_pressure' && (
        <div className="mt-3">
          <BpTrendChart checkIns={checkIns} config={program.config} />
        </div>
      )}

      {program.type === 'wound_care' && checkIns.some((c) => c.image_path) && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {checkIns
            .filter((c) => c.image_path)
            .map((c) => (
              <a key={c.id} href={`${API_URL}/storage/${c.image_path}`} target="_blank" rel="noreferrer">
                <img
                  src={`${API_URL}/storage/${c.image_path}`}
                  alt="Wound photo"
                  className="aspect-square w-full rounded-lg object-cover"
                />
              </a>
            ))}
        </div>
      )}

      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
        {checkIns.length === 0 && <p className="text-sm text-slate-400">No check-ins yet.</p>}
        {checkIns.slice(0, 6).map((c) => (
          <div key={c.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {c.flagged && <AlertTriangle size={13} className="text-red-600" />}
              <span className={c.flagged ? 'font-medium text-red-700' : 'text-slate-700'}>{describeCheckIn(c)}</span>
              <span className="text-xs text-slate-400">via {c.source}</span>
            </div>
            <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>

      <ReminderForm patientId={patient.id} programId={program.id} reminders={program.reminders || []} />
    </div>
  )
}

function AddProgramForm({ patientId, onDone }) {
  const [type, setType] = useState('blood_pressure')
  const createProgram = useCreateProgram(patientId)

  function handleSubmit(e) {
    e.preventDefault()
    createProgram.mutate({ type, config: {} }, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-4">
      <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
        {Object.entries(PROGRAM_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700">
        Add program
      </button>
    </form>
  )
}

export default function PatientDetailPage() {
  const { id } = useParams()
  const { data: patient, isLoading } = usePatient(id)
  const [showAddProgram, setShowAddProgram] = useState(false)
  const [copied, setCopied] = useState(false)

  if (isLoading) return <p className="text-sm text-slate-400">Loading...</p>
  if (!patient) return <p className="text-sm text-slate-400">Patient not found.</p>

  const reportUrl = `${REPORT_URL}/report/${patient.report_token}`

  return (
    <div>
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={15} />
        Back to patients
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{patient.name}</h1>
          <p className="text-sm text-slate-500">{patient.phone}</p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(reportUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <Copy size={13} />
          {copied ? 'Copied!' : 'Copy patient report link'}
        </button>
      </div>

      <div className="space-y-4">
        {patient.programs?.map((program) => (
          <ProgramSection key={program.id} patient={patient} program={program} />
        ))}

        {showAddProgram ? (
          <AddProgramForm patientId={patient.id} onDone={() => setShowAddProgram(false)} />
        ) : (
          <button
            onClick={() => setShowAddProgram(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white py-3 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            <Plus size={15} />
            Add monitoring program
          </button>
        )}
      </div>
    </div>
  )
}
