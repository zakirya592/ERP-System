export const inventorySummary = {
  inventoryValue: 684290,
  activeBatches: 1284,
  substitutableBatches: 18,
  substitutableShare: 30,
  outOfStock: 12,
  damaged: 4,
}

export const warehouseOptions = [
  { label: 'All warehouses', value: '' },
  { label: 'Main Warehouse', value: 'Main WH' },
  { label: 'Reserve Warehouse', value: 'Reserve WH' },
  { label: 'East Depot', value: 'East Depot' },
]

export const stateOptions = [
  { label: 'All states', value: '' },
  { label: 'Available', value: 'available' },
  { label: 'Hold', value: 'hold' },
  { label: 'Damaged', value: 'damaged' },
]

export const expiryOptions = [
  { label: 'All expiry dates', value: '' },
  { label: 'Expiring soon (≤30 days)', value: 'soon' },
  { label: 'Within 90 days', value: '90' },
  { label: 'No expiry', value: 'none' },
]

export const stateTabs = [
  { key: 'all', label: 'All batches' },
  { key: 'available', label: 'Available' },
  { key: 'hold', label: 'Hold' },
  { key: 'damaged', label: 'Damaged' },
]

export const inventoryItems = [
  {
    id: '1',
    sku: 'BEV-1842',
    product: 'Arabica Coffee 1 kg',
    warehouse: 'Main WH',
    batch: 'CP-2508-A',
    serial: '',
    expiry: '2027-09-30',
    quantity: 75,
    unit: 'bag',
    unitCost: 12.45,
    state: 'available',
    substitutable: false,
  },
  {
    id: '2',
    sku: 'DAI-2201',
    product: 'Whole Milk 1 L',
    warehouse: 'Main WH',
    batch: 'ML-2610-C',
    serial: '',
    expiry: '2026-10-12',
    quantity: 126,
    unit: 'crates',
    unitCost: 19.8,
    state: 'available',
    substitutable: true,
  },
  {
    id: '3',
    sku: 'PLN-8801',
    product: 'Plain Flour 5 kg',
    warehouse: 'East Depot',
    batch: 'FL-2504-B',
    serial: '',
    expiry: '2026-11-05',
    quantity: 16,
    unit: 'bag',
    unitCost: 8.2,
    state: 'hold',
    substitutable: false,
  },
  {
    id: '4',
    sku: 'OIL-4410',
    product: 'Sunflower Oil 5 L',
    warehouse: 'Reserve WH',
    batch: 'OL-2509-D',
    serial: 'SN-88291',
    expiry: '2028-01-15',
    quantity: 48,
    unit: 'pcs',
    unitCost: 768,
    state: 'available',
    substitutable: false,
  },
  {
    id: '5',
    sku: 'RCE-3102',
    product: 'Basmati Rice 10 kg',
    warehouse: 'Main WH',
    batch: 'RC-2507-A',
    serial: '',
    expiry: '2027-03-20',
    quantity: 210,
    unit: 'bag',
    unitCost: 45.5,
    state: 'available',
    substitutable: true,
  },
  {
    id: '6',
    sku: 'SNK-7720',
    product: 'Salted Chips 150 g',
    warehouse: 'East Depot',
    batch: 'CH-2601-F',
    serial: '',
    expiry: '2026-10-30',
    quantity: 2,
    unit: 'pcs',
    unitCost: 3.25,
    state: 'damaged',
    substitutable: false,
  },
  {
    id: '7',
    sku: 'TEA-5511',
    product: 'Green Tea 250 g',
    warehouse: 'Main WH',
    batch: 'GT-2506-E',
    serial: '',
    expiry: '2027-12-01',
    quantity: 64,
    unit: 'box',
    unitCost: 22.1,
    state: 'available',
    substitutable: false,
  },
  {
    id: '8',
    sku: 'SPX-9904',
    product: 'Black Pepper 500 g',
    warehouse: 'Reserve WH',
    batch: 'BP-2503-G',
    serial: '',
    expiry: null,
    quantity: 0,
    unit: 'pcs',
    unitCost: 15.75,
    state: 'available',
    substitutable: false,
  },
  {
    id: '9',
    sku: 'JUI-1120',
    product: 'Orange Juice 1 L',
    warehouse: 'Main WH',
    batch: 'OJ-2610-H',
    serial: '',
    expiry: '2026-10-28',
    quantity: 38,
    unit: 'crates',
    unitCost: 11.4,
    state: 'hold',
    substitutable: true,
  },
  {
    id: '10',
    sku: 'CAN-3340',
    product: 'Tomato Paste 400 g',
    warehouse: 'East Depot',
    batch: 'TP-2508-J',
    serial: 'SN-44102',
    expiry: '2028-06-18',
    quantity: 90,
    unit: 'pcs',
    unitCost: 6.8,
    state: 'available',
    substitutable: false,
  },
  {
    id: '11',
    sku: 'NDL-6677',
    product: 'Egg Noodles 400 g',
    warehouse: 'Main WH',
    batch: 'ND-2505-K',
    serial: '',
    expiry: '2026-11-18',
    quantity: 7,
    unit: 'box',
    unitCost: 4.9,
    state: 'damaged',
    substitutable: false,
  },
  {
    id: '12',
    sku: 'SGR-2288',
    product: 'White Sugar 1 kg',
    warehouse: 'Reserve WH',
    batch: 'SG-2509-L',
    serial: '',
    expiry: '2029-01-01',
    quantity: 320,
    unit: 'bag',
    unitCost: 2.15,
    state: 'available',
    substitutable: false,
  },
]

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

export function daysUntilExpiry(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function expiryRisk(item) {
  const days = daysUntilExpiry(item.expiry)
  if (days === null) return { label: 'Not applicable', tone: 'muted' }
  if (days < 0) return { label: 'Expired', tone: 'danger' }
  if (days <= 30) return { label: 'Expiring soon', tone: 'warning', days }
  return { label: `${days} days`, tone: 'muted', days }
}

export function lineValue(item) {
  return (Number(item.quantity) || 0) * (Number(item.unitCost) || 0)
}

export function mostUrgentExpiry(items) {
  return items
    .filter((item) => item.expiry && item.state !== 'damaged')
    .map((item) => ({ ...item, days: daysUntilExpiry(item.expiry) }))
    .filter((item) => item.days !== null && item.days >= 0)
    .sort((a, b) => a.days - b.days)[0] || null
}

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
