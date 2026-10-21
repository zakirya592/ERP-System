export const damageDocument = {
  number: 'DMG-00087',
  branch: 'Central Branch',
  warehouse: 'Main Warehouse',
  reportedOn: 'Oct 01, 2026 · 09:20',
  reportedBy: 'Sara Noor',
  approver: 'Nadia Saleh',
  damageType: 'Leaked',
  reason: 'Three containers found leaking at the cap during receiving-area inspection. Isolated for review; warehouse stock quantity is unchanged.',
  evidence: 'inspection-00187.pdf · 2 photos attached',
}

export const damageTypes = ['Broken', 'Expired', 'Leaked', 'Defective', 'Lost', 'Other']

export const damageSteps = [
  { key: 'draft', label: '1 Draft' },
  { key: 'pending', label: '2 Pending' },
  { key: 'approved', label: '3 Approved' },
  { key: 'rejected', label: '4 Rejected' },
  { key: 'cancelled', label: '5 Cancelled' },
]

export const damageLine = {
  sku: 'CLN-2201',
  product: 'Floor Cleaner 5 L',
  batch: 'CL-0906-B',
  expiry: 'Aug 31, 2026',
  qty: 3,
  unit: 'pcs',
  unitCost: 7.65,
  stockBefore: 12,
}

export const damageAudit = [
  { time: 'Oct 01 09:25', actor: 'Sara Noor', detail: 'Attached inspection evidence to DMG-00087' },
  { time: 'Oct 01 09:20', actor: 'Sara Noor', detail: 'Created draft report for 3 pcs · Leaked' },
]

export function lineValue(line) {
  return Number((line.qty * line.unitCost).toFixed(2))
}
