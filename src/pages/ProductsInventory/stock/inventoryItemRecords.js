export const stateOptions = [
  { label: 'All states', value: '' },
  { label: 'Available', value: 'available' },
  { label: 'Hold', value: 'hold' },
  { label: 'Damaged', value: 'damaged' },
]

export const expiryRiskOptions = [
  { label: 'All expiry risks', value: '' },
  { label: 'OK', value: 'ok' },
  { label: 'Expiring soon', value: 'expiring_soon' },
  { label: 'Quality check', value: 'quality_check' },
  { label: 'Quarantined', value: 'quarantined' },
]

export const stateTabs = [
  { key: 'all', label: 'All batches' },
  { key: 'available', label: 'Available' },
  { key: 'hold', label: 'Hold' },
  { key: 'damaged', label: 'Damaged' },
]

export const stateClass = {
  available: 'bg-emerald-50 text-emerald-700',
  hold: 'bg-amber-50 text-amber-700',
  damaged: 'bg-rose-50 text-rose-600',
}

export const stateLabel = {
  available: 'Available',
  hold: 'Hold',
  damaged: 'Damaged',
}

export const expiryRiskClass = {
  ok: 'text-slate-400',
  expiring_soon: 'bg-amber-50 text-amber-700',
  quality_check: 'bg-sky-50 text-sky-700',
  quarantined: 'bg-rose-50 text-rose-600',
}

export function formatPkr(value, { compact = false } = {}) {
  const amount = Number(value)
  if (Number.isNaN(amount)) return '—'
  const digits = compact ? 0 : 2
  return `PKR ${amount.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}

export function formatExpiry(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function refName(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.name || value.code || value.shortCode || ''
}

export function unitLabel(unit) {
  if (!unit) return '—'
  if (typeof unit === 'string') return unit
  return unit.shortCode || unit.name || '—'
}

export function quantityLabel(item) {
  const qty = Number(item?.quantity)
  const amount = Number.isNaN(qty) ? item?.quantity || '—' : qty.toLocaleString('en-US')
  return `${amount} ${unitLabel(item?.unit)}`
}
