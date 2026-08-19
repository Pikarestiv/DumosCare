export function describeCheckIn(checkIn) {
  const d = checkIn.structured_data || {}
  if ('systolic' in d) return `BP ${d.systolic}/${d.diastolic} mmHg`
  if ('taken' in d) return d.taken ? 'Medication taken' : 'Medication missed'
  if (d.note) return d.note
  if (d.caption) return d.caption
  return 'Check-in received'
}
