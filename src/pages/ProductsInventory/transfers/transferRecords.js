export const transferLines = [
  { sku: 'BEV-1042', product: 'Arabica Coffee 1 kg', unit: 'bag', shipped: 24, batch: 'CF-260918' },
  { sku: 'SNK-1510', product: 'Sea Salt Crackers', unit: 'box', shipped: 12, batch: 'SC-260901' },
  { sku: 'HYG-4032', product: 'Hand Wash 500 ml', unit: 'pcs', shipped: 16, batch: 'HW-260824' },
  { sku: 'PKG-3116', product: 'Paper Carry Bag L', unit: 'pcs', shipped: 12, batch: '' },
]

export const transferDocument = {
  number: 'TR-00812',
  from: 'Central Branch · Main Warehouse',
  to: 'Central Branch · Airport Shop Store',
  warehouse: 'Main Warehouse',
  destination: 'Airport Shop Store',
  reason: 'Store replenishment',
  created: 'Sep 30',
  expected: 'Oct 01',
  vehicle: 'WH-04',
  preparedBy: 'Omar Khalid',
  approvedBy: 'Amira Rahman',
  receiver: 'Lina Abbas',
}

export const workflow = [
  { key: 'draft', label: 'Draft', detail: 'Sep 30 · 09:15' },
  { key: 'in-transit', label: 'In Transit', detail: 'Sep 30 · 13:10' },
  { key: 'received', label: 'Received', detail: 'Awaiting receiver' },
]

export const shippedUnits = transferLines.reduce((sum, line) => sum + line.shipped, 0)
