export const STATUS_LABELS: Record<string, string> = {
  active: 'פעיל',
  completed: 'הסתיים',
  paused: 'מוקפא',
  cancelled: 'בוטל',
}

export const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  active: {
    badge: 'bg-emerald-200 text-emerald-900 border border-emerald-400',
    dot: 'bg-emerald-500',
  },
  completed: {
    badge: 'bg-blue-200 text-blue-900 border border-blue-400',
    dot: 'bg-blue-500',
  },
  paused: {
    badge: 'bg-amber-200 text-amber-900 border border-amber-400',
    dot: 'bg-amber-500',
  },
  cancelled: {
    badge: 'bg-red-200 text-red-900 border border-red-400',
    dot: 'bg-red-500',
  },
}

const STATUS_KEY_ALIASES: Record<string, keyof typeof STATUS_LABELS> = {
  active: 'active',
  'פעיל': 'active',

  completed: 'completed',
  complete: 'completed',
  'הסתיים': 'completed',

  paused: 'paused',
  pause: 'paused',
  'מוקפא': 'paused',

  cancelled: 'cancelled',
  canceled: 'cancelled',
  'בוטל': 'cancelled',
}

const STRIP_DIRECTIONAL_CHARS = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g

export function normalizeStatusKey(status?: string) {
  if (!status) return undefined
  const sanitized = status.replace(STRIP_DIRECTIONAL_CHARS, '')
  const trimmed = sanitized.trim()
  const key = trimmed.toLowerCase()
  const aliasMatch = STATUS_KEY_ALIASES[key]
  if (aliasMatch) {
    return aliasMatch
  }

  const compactHebrew = trimmed.replace(/\s+/g, '')
  if (compactHebrew.includes('פעיל')) {
    return 'active'
  }
  if (compactHebrew.includes('מוקפא')) {
    return 'paused'
  }
  if (compactHebrew.includes('הסתי')) {
    return 'completed'
  }
  if (compactHebrew.includes('בוטל')) {
    return 'cancelled'
  }

  const labelMatch = Object.entries(STATUS_LABELS).find(
    ([, label]) => label.replace(STRIP_DIRECTIONAL_CHARS, '').trim() === trimmed
  )
  if (labelMatch) {
    return labelMatch[0] as keyof typeof STATUS_LABELS
  }

  return undefined
}

export function getStatusLabel(status?: string) {
  const normalizedKey = normalizeStatusKey(status)
  if (!normalizedKey) {
    return status || ''
  }
  return STATUS_LABELS[normalizedKey] || status || ''
}

export function getStatusStyle(status?: string) {
  const normalizedKey = normalizeStatusKey(status)
  if (!normalizedKey) {
    return { badge: 'bg-gray-200 text-gray-700 border border-gray-400', dot: 'bg-gray-400' }
  }
  return STATUS_STYLES[normalizedKey] || { badge: 'bg-gray-200 text-gray-700 border border-gray-400', dot: 'bg-gray-400' }
}
