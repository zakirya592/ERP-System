export const adjustmentLines = [
  { sku: 'BEV-1042', product: 'Arabica Coffee 1 kg', unit: 'bag', system: 18, counted: 16, unitCost: 12.4 },
  { sku: 'CLN-2201', product: 'Floor Cleaner 5 L', unit: 'pcs', system: 12, counted: 12, unitCost: 7.85 },
  { sku: 'PKG-3116', product: 'Paper Carry Bag L', unit: 'pcs', system: 86, counted: 90, unitCost: 0.18 },
  { sku: 'DRY-0814', product: 'Basmati Rice 25 kg', unit: 'bag', system: 7, counted: 7, unitCost: 28.1 },
]

export const adjustmentDocument = {
  number: 'ADJ-01428',
  branch: 'Central Branch',
  warehouse: 'Main Warehouse',
  countedOn: 'Oct 01, 2026 · 08:30',
  reason: 'Cycle count variance',
  reference: 'COUNT-00132',
  createdBy: 'Sara Noor · Warehouse Officer',
  approver: 'Nadia Saleh · Warehouse Manager',
  submitted: 'Oct 01 · 08:05',
  approval: 'Not yet approved',
  auditNumber: 'ADJ-00218',
  countNote: 'Coffee shortage confirmed by second count; four loose carry bags found in packing area.',
}

export const adjustmentSteps = [
  { key: 'draft', label: '1 Draft' },
  { key: 'pending', label: '2 Pending' },
  { key: 'approved', label: '3 Approved' },
  { key: 'rejected', label: '4 Rejected' },
]

export const auditHistory = [
  { time: 'Oct 01 09:05', actor: 'Sara Noor', detail: 'Submitted for approval - no stock movement created' },
  { time: 'Oct 01 08:45', actor: 'Sara Noor', detail: 'Entered actual quantities from COUNT-00132' },
  { time: 'Oct 01 08:30', actor: 'Sara Noor', detail: 'Created draft adjustment' },
]

export function lineVariance(line) {
  return line.counted - line.system
}

export function lineValue(line) {
  return Number((lineVariance(line) * line.unitCost).toFixed(2))
}

export const netValue = adjustmentLines.reduce((sum, line) => sum + lineValue(line), 0)

export function formatPkr(value) {
  const amount = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (value < 0) return `-PKR ${amount}`
  if (value > 0) return `+PKR ${amount}`
  return `PKR ${amount}`
}
