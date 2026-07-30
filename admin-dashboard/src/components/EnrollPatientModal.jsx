import { useState } from 'react'
import { X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useCreatePatient } from '../lib/hooks'

const PROGRAM_TYPES = [
  { value: 'blood_pressure', label: 'Blood pressure' },
  { value: 'medication_adherence', label: 'Medication adherence' },
  { value: 'wound_care', label: 'Wound care' },
  { value: 'general_checkin', label: 'General check-in' },
]

export default function EnrollPatientModal({ onClose }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [programType, setProgramType] = useState('blood_pressure')
  const [medication, setMedication] = useState('')
  const [woundSite, setWoundSite] = useState('')
  const [error, setError] = useState(null)

  const createPatient = useCreatePatient()
  const queryClient = useQueryClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const patient = await createPatient.mutateAsync({ name, phone })

      const config =
        programType === 'medication_adherence'
          ? { medication }
          : programType === 'wound_care'
            ? { site: woundSite }
            : {}

      await api.post(`/patients/${patient.id}/programs`, { type: programType, config })
      queryClient.invalidateQueries({ queryKey: ['patients'] })

      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Enroll patient</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone (E.164)</label>
            <input
              required
              placeholder="+15551234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Monitoring program</label>
            <select
              value={programType}
              onChange={(e) => setProgramType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {PROGRAM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {programType === 'medication_adherence' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Medication</label>
              <input
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="e.g. Metformin 500mg"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          {programType === 'wound_care' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Wound site</label>
              <input
                value={woundSite}
                onChange={(e) => setWoundSite(e.target.value)}
                placeholder="e.g. Left lower leg"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPatient.isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {createPatient.isPending ? 'Enrolling...' : 'Enroll patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
