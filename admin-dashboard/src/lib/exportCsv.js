function toCsvValue(value) {
  const str = String(value ?? '')
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(toCsvValue).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportPatientsCsv(patients) {
  const header = ['Name', 'Phone', 'Active programs', 'Last check-in', 'Flagged check-ins']
  const rows = patients.map((p) => [
    p.name,
    p.phone,
    p.active_programs.join('; '),
    p.last_check_in_at ? new Date(p.last_check_in_at).toISOString().slice(0, 10) : '',
    p.flagged_count,
  ])
  downloadCsv(`dumos-care-patients-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows])
}
