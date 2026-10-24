export const movementTypeOptions = [
  { label: 'All movement types', value: '' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Sale', value: 'sale' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Adjustment', value: 'adjustment' },
]

export function formatPosted(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPkr(value) {
  const amount = Number(value)
  if (Number.isNaN(amount)) return '—'
  return `PKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function movementQty(item) {
  const quantityIn = Number(item?.quantityIn) || 0
  const quantityOut = Number(item?.quantityOut) || 0
  if (quantityIn > 0 && quantityOut === 0) return quantityIn
  if (quantityOut > 0 && quantityIn === 0) return -quantityOut
  return quantityIn - quantityOut
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
