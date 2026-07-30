import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Activity, Camera, CheckCircle2, Heart, Pill, Send } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8123'

const PROGRAM_META = {
  blood_pressure: { label: 'Blood pressure', icon: Heart },
  medication_adherence: { label: 'Medication', icon: Pill },
  wound_care: { label: 'Wound photo', icon: Camera },
  general_checkin: { label: 'How are you feeling?', icon: Activity },
}

export default function ReportPage() {
  const { token } = useParams()
  const [state, setState] = useState({ loading: true, error: null, patient: null, programs: [] })
  const [activeProgram, setActiveProgram] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    axios
      .get(`${API_URL}/api/report/${token}`)
      .then(({ data }) => {
        setState({ loading: false, error: null, patient: data.patient, programs: data.programs })
        if (data.programs.length === 1) setActiveProgram(data.programs[0])
      })
      .catch(() => {
        setState({ loading: false, error: 'This link is invalid or has expired.', patient: null, programs: [] })
      })
  }, [token])

  if (state.loading) {
    return <CenteredMessage>Loading your check-in form...</CenteredMessage>
  }

  if (state.error) {
    return <CenteredMessage>{state.error}</CenteredMessage>
  }

  if (submitted) {
    return (
      <CenteredMessage>
        <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={48} />
        <p className="text-lg font-semibold text-slate-900">Thank you!</p>
        <p className="mt-1 text-slate-500">Your check-in was received.</p>
      </CenteredMessage>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-1 text-center text-2xl font-semibold text-slate-900">
          Hi {state.patient.name.split(' ')[0]}
        </h1>
        <p className="mb-6 text-center text-slate-500">Please share your check-in below.</p>

        {!activeProgram && (
          <div className="space-y-3">
            {state.programs.map((program) => {
              const meta = PROGRAM_META[program.type] || PROGRAM_META.general_checkin
              const Icon = meta.icon
              return (
                <button
                  key={program.id}
                  onClick={() => setActiveProgram(program)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm active:bg-slate-50"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                    <Icon className="text-emerald-600" size={22} />
                  </div>
                  <span className="text-lg font-medium text-slate-900">{meta.label}</span>
                </button>
              )
            })}
            {state.programs.length === 0 && (
              <p className="text-center text-slate-500">You have no active check-ins right now.</p>
            )}
          </div>
        )}

        {activeProgram && (
          <CheckInForm
            token={token}
            program={activeProgram}
            onBack={state.programs.length > 1 ? () => setActiveProgram(null) : null}
            onSubmitted={() => setSubmitted(true)}
          />
        )}
      </div>
    </div>
  )
}

function CenteredMessage({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
      <div>{children}</div>
    </div>
  )
}

function CheckInForm({ token, program, onBack, onSubmitted }) {
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [taken, setTaken] = useState(null)
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    setPhoto(file || null)
    setPhotoPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const formData = new FormData()
    formData.append('program_id', program.id)
    if (program.type === 'blood_pressure') {
      formData.append('systolic', systolic)
      formData.append('diastolic', diastolic)
    }
    if (program.type === 'medication_adherence') {
      formData.append('taken', taken ? '1' : '0')
      if (note) formData.append('note', note)
    }
    if (program.type === 'wound_care' || program.type === 'general_checkin') {
      if (note) formData.append('note', note)
      if (photo) formData.append('photo', photo)
    }

    try {
      await axios.post(`${API_URL}/api/report/${token}`, formData)
      onSubmitted()
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const meta = PROGRAM_META[program.type] || PROGRAM_META.general_checkin

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold text-slate-900">{meta.label}</h2>

      {program.type === 'blood_pressure' && (
        <div className="mb-5 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Systolic (top)</label>
            <input
              type="number"
              inputMode="numeric"
              required
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="120"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Diastolic (bottom)</label>
            <input
              type="number"
              inputMode="numeric"
              required
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="80"
            />
          </div>
        </div>
      )}

      {program.type === 'medication_adherence' && (
        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-slate-600">Did you take your medication today?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTaken(true)}
              className={`rounded-xl border-2 py-4 text-lg font-semibold transition-colors ${
                taken === true
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setTaken(false)}
              className={`rounded-xl border-2 py-4 text-lg font-semibold transition-colors ${
                taken === false ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500'
              }`}
            >
              No
            </button>
          </div>
        </div>
      )}

      {(program.type === 'wound_care' || program.type === 'general_checkin' || program.type === 'medication_adherence') && (
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            {program.type === 'general_checkin' ? 'How are you feeling?' : 'Notes (optional)'}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Type here..."
          />
        </div>
      )}

      {program.type === 'wound_care' && (
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium text-slate-600">Photo of the wound</label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-8 text-slate-500 active:bg-slate-50">
            <Camera size={28} />
            <span className="text-sm">{photo ? photo.name : 'Tap to take or choose a photo'}</span>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
          </label>
          {photoPreview && (
            <img src={photoPreview} alt="Preview" className="mt-3 max-h-48 w-full rounded-xl object-cover" />
          )}
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || (program.type === 'medication_adherence' && taken === null)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        <Send size={18} />
        {submitting ? 'Sending...' : 'Submit'}
      </button>

      {onBack && (
        <button type="button" onClick={onBack} className="mt-3 w-full text-sm text-slate-400">
          Back
        </button>
      )}
    </form>
  )
}
