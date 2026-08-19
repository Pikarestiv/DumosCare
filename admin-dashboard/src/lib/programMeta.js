import { Activity, Camera, Heart, Pill } from 'lucide-react'

export const PROGRAM_META = {
  blood_pressure: { label: 'Blood pressure', shortLabel: 'Blood pressure', icon: Heart, chip: 'bg-sky-50 text-sky-600', pill: 'bg-sky-50 text-sky-700' },
  medication_adherence: { label: 'Medication adherence', shortLabel: 'Medication', icon: Pill, chip: 'bg-violet-50 text-violet-600', pill: 'bg-violet-50 text-violet-700' },
  wound_care: { label: 'Wound care', shortLabel: 'Wound care', icon: Camera, chip: 'bg-amber-50 text-amber-600', pill: 'bg-amber-50 text-amber-700' },
  general_checkin: { label: 'General check-in', shortLabel: 'Check-in', icon: Activity, chip: 'bg-emerald-50 text-emerald-600', pill: 'bg-emerald-50 text-emerald-700' },
}

export function programMeta(type) {
  return PROGRAM_META[type] || PROGRAM_META.general_checkin
}

const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

export function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

export function avatarColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}
