import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useCreateReminder, useDeleteReminder } from '../lib/hooks'

export default function ReminderForm({ patientId, programId, reminders }) {
  const [channel, setChannel] = useState('whatsapp')
  const [frequency, setFrequency] = useState('daily')
  const [timeOfDay, setTimeOfDay] = useState('09:00')
  const [messageTemplate, setMessageTemplate] = useState('Hi {name}, time for your check-in.')
  const createReminder = useCreateReminder(patientId)
  const deleteReminder = useDeleteReminder(patientId)

  function handleSubmit(e) {
    e.preventDefault()
    createReminder.mutate(
      { programId, channel, frequency, time_of_day: timeOfDay, message_template: messageTemplate },
      { onSuccess: () => setMessageTemplate('Hi {name}, time for your check-in.') },
    )
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Reminders</p>

      {reminders.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {reminders.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
              <span>
                <span className="font-medium capitalize">{r.channel}</span> · {r.frequency.replace('_', ' ')} at {r.time_of_day?.slice(0, 5)}
              </span>
              <button onClick={() => deleteReminder.mutate(r.id)} className="text-slate-400 hover:text-red-600">
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>
        <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
          <option value="daily">Daily</option>
          <option value="twice_daily">Twice daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <input
          type="time"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
        />
        <input
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          className="min-w-[180px] flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
        />
        <button
          type="submit"
          disabled={createReminder.isPending}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
        >
          Add
        </button>
      </form>
    </div>
  )
}
