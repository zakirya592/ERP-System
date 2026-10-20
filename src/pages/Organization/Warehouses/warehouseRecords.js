export const warehouseRule =
  'Warehouse access is scoped to the parent branch. A location with stock or open transfers cannot be archived.'

export const warehouseAccess =
  'Quality hold stock remains visible but unavailable for normal dispatch.'

export const warehouseTypes = [
  { value: 'finished_goods', label: 'Finished goods' },
  { value: 'raw_materials', label: 'Raw materials' },
  { value: 'transit', label: 'Transit' },
  { value: 'quarantine', label: 'Quarantine' },
  { value: 'mixed', label: 'Mixed' },
]

export const binTrackingOptions = [
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
]

export const negativeStockOptions = [
  { value: 'blocked', label: 'Blocked' },
  { value: 'allowed', label: 'Allowed' },
]

export const warehouseStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const apiFields = {
  branchId: 'branchId',
  name: 'name',
  code: 'code',
  warehouseType: 'warehouseType',
  location: 'location',
  address: 'address',
  phone: 'phone',
  floorArea: 'floorArea',
  storageCapacity: 'storageCapacity',
  managerId: 'managerId',
  stockAccount: 'stockAccount',
  defaultZone: 'defaultZone',
  binTracking: 'binTracking',
  negativeStock: 'negativeStock',
  notes: 'notes',
  status: 'status',
}

export function idOf(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id || ''
}

export function display(value, empty = '—') {
  const text = String(value ?? '').trim()
  return text || empty
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return display(value)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

export function titleFromValue(value) {
  const text = String(value || '').replace(/[_-]+/g, ' ').trim()
  if (!text) return '—'
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

export function statusText(record) {
  if (record?.statusLabel) return record.statusLabel
  if (!record?.status) return '—'
  return titleFromValue(record.status)
}

export function statusClassName(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'active') return 'bg-[#e7f8ee] text-[#1f9d57]'
  if (value === 'inactive') return 'bg-[#eef1f4] text-[#8b95a5]'
  return 'bg-slate-100 text-slate-500'
}

export function withOption(options, value, label) {
  if (!value || options.some((option) => option.value === value)) return options
  return [{ value, label: label || titleFromValue(value) }, ...options]
}

export function optionLabel(options, value) {
  if (!value) return ''
  const match = options.find((option) => option.value === value)
  return match?.label || titleFromValue(value)
}

function relatedName(value) {
  if (!value || typeof value !== 'object') return ''
  return value.name || value.code || ''
}

export function branchNameOf(warehouse) {
  return relatedName(warehouse?.branchId)
}

export function managerNameOf(warehouse) {
  return relatedName(warehouse?.managerId)
}

export function mapLocation(item, index) {
  const manager = relatedName(item.managerId)
  return {
    id: item._id || `location-${index}`,
    code: item.code || '',
    name: item.name || '',
    type: item.typeLabel || titleFromValue(item.type),
    custodian: manager || (item.managerId ? 'Assigned' : 'Unassigned'),
    status: item.statusLabel || titleFromValue(item.status),
  }
}

export function mapWarehouse(warehouse) {
  const custodian = managerNameOf(warehouse)
  return {
    id: warehouse._id,
    code: warehouse.code || '',
    name: warehouse.name || '',
    branchId: idOf(warehouse.branchId),
    branch: branchNameOf(warehouse),
    type: warehouse.warehouseTypeLabel || titleFromValue(warehouse.warehouseType),
    warehouseType: warehouse.warehouseType || '',
    custodian: custodian || (warehouse.managerId ? 'Assigned' : 'Unassigned'),
    managerId: idOf(warehouse.managerId),
    status: statusText(warehouse),
    statusValue: warehouse.status || '',
    location: warehouse.location || '',
    address: warehouse.address || '',
    phone: warehouse.phone || '',
    floorArea: warehouse.floorArea || '',
    storageCapacity: warehouse.storageCapacity || '',
    stockAccount: warehouse.stockAccount || '',
    defaultZone: warehouse.defaultZone || '',
    binTracking: optionLabel(binTrackingOptions, warehouse.binTracking),
    negativeStock: optionLabel(negativeStockOptions, warehouse.negativeStock),
    notes: warehouse.notes || '',
    createdOn: formatDate(warehouse.createdAt),
    updatedOn: formatDate(warehouse.updatedAt),
    summary: warehouse.notes || warehouseRule,
    access: warehouseAccess,
    locations: (warehouse.locations || []).map(mapLocation),
  }
}

export function formFromWarehouse(warehouse) {
  return {
    name: warehouse.name || '',
    code: warehouse.code || '',
    branchId: idOf(warehouse.branchId),
    warehouseType: warehouse.warehouseType || '',
    location: warehouse.location || '',
    address: warehouse.address || '',
    phone: warehouse.phone || '',
    floorArea: warehouse.floorArea || '',
    storageCapacity: warehouse.storageCapacity || '',
    managerId: idOf(warehouse.managerId),
    stockAccount: warehouse.stockAccount || '',
    defaultZone: warehouse.defaultZone || '',
    binTracking: warehouse.binTracking || '',
    negativeStock: warehouse.negativeStock || '',
    status: warehouse.status || 'active',
    notes: warehouse.notes || '',
  }
}

export function toWarehouseBody(form) {
  return {
    branchId: String(form.branchId || '').trim(),
    name: form.name.trim(),
    code: form.code.trim(),
    warehouseType: form.warehouseType.trim(),
    location: form.location.trim(),
    address: form.address.trim(),
    phone: form.phone.trim(),
    floorArea: form.floorArea.trim(),
    storageCapacity: form.storageCapacity.trim(),
    managerId: form.managerId || null,
    stockAccount: form.stockAccount.trim(),
    defaultZone: form.defaultZone.trim(),
    binTracking: form.binTracking.trim(),
    negativeStock: form.negativeStock.trim(),
    notes: form.notes.trim(),
    status: form.status || 'active',
  }
}

export function applyApiErrors(error, setErrors) {
  const apiErrors = error.response?.data?.errors
  if (!Array.isArray(apiErrors)) return
  const fieldErrors = {}
  apiErrors.forEach((item) => {
    const key = apiFields[item.field] || item.field
    if (key && !fieldErrors[key]) fieldErrors[key] = item.message
  })
  setErrors((current) => ({ ...current, ...fieldErrors }))
}
