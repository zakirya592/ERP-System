export const shopRule =
  'Select the branch before choosing a linked warehouse. Only warehouses in that branch are available.'

export const shopAccess =
  "Sales default to this shop's warehouse and price list. Cash follows the assigned role."

export const shopTypes = [
  { value: 'retail', label: 'Retail outlet' },
  { value: 'outlet', label: 'Outlet' },
  { value: 'counter', label: 'Counter' },
  { value: 'wholesale', label: 'Wholesale' },
]

export const shopStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const priceLists = [
  { value: 'Standard retail', label: 'Standard retail' },
  { value: 'Wholesale', label: 'Wholesale' },
  { value: 'Airport', label: 'Airport' },
]

export const apiFields = {
  branchId: 'branchId',
  name: 'name',
  code: 'code',
  shopType: 'shopType',
  location: 'location',
  address: 'address',
  phone: 'phone',
  email: 'email',
  warehouseId: 'warehouseId',
  priceList: 'priceList',
  cashAccount: 'cashAccount',
  openingHours: 'openingHours',
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

function relatedName(value) {
  if (!value || typeof value !== 'object') return ''
  return value.name || value.code || ''
}

export function branchNameOf(shop) {
  return relatedName(shop?.branchId)
}

export function warehouseNameOf(shop) {
  return relatedName(shop?.warehouseId)
}

export function shopSummary(shop) {
  if (shop?.notes) return shop.notes
  const warehouse = warehouseNameOf(shop)
  const branch = branchNameOf(shop)
  if (warehouse && branch) {
    return `${shop.name} sells from ${warehouse}. Only warehouses in ${branch} are available.`
  }
  return shopRule
}

export function mapShopEmployee(item, index) {
  return {
    id: item._id || `employee-${index}`,
    code: item.code || '',
    name: item.name || '',
    role: item.role || '',
    assignment: item.assignment ? titleFromValue(item.assignment) : '—',
    status: item.statusLabel || titleFromValue(item.status),
  }
}

export function mapShop(shop) {
  return {
    id: shop._id,
    code: shop.code || '',
    name: shop.name || '',
    branchId: idOf(shop.branchId),
    branch: branchNameOf(shop),
    status: statusText(shop),
    statusValue: shop.status || '',
    type: shop.shopTypeLabel || titleFromValue(shop.shopType),
    shopType: shop.shopType || '',
    address: shop.address || '',
    location: shop.location || '',
    phone: shop.phone || '',
    email: shop.email || '',
    warehouseId: idOf(shop.warehouseId),
    warehouse: warehouseNameOf(shop),
    priceList: shop.priceList || '',
    cashAccount: shop.cashAccount || '',
    openingHours: shop.openingHours || '',
    notes: shop.notes || '',
    createdOn: formatDate(shop.createdAt),
    updatedOn: formatDate(shop.updatedAt),
    summary: shopSummary(shop),
    access: shopAccess,
    employees: (shop.employees || []).map(mapShopEmployee),
  }
}

export function formFromShop(shop) {
  return {
    name: shop.name || '',
    code: shop.code || '',
    branchId: idOf(shop.branchId),
    shopType: shop.shopType || 'retail',
    address: shop.address || '',
    location: shop.location || '',
    phone: shop.phone || '',
    email: shop.email || '',
    warehouseId: idOf(shop.warehouseId),
    priceList: shop.priceList || '',
    cashAccount: shop.cashAccount || '',
    openingHours: shop.openingHours || '',
    status: shop.status || 'active',
    notes: shop.notes || '',
  }
}

export function toShopBody(form) {
  return {
    branchId: String(form.branchId || '').trim(),
    name: form.name.trim(),
    code: form.code.trim(),
    shopType: form.shopType || 'retail',
    location: form.location.trim(),
    address: form.address.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    managerId: null,
    warehouseId: form.warehouseId || null,
    priceList: form.priceList.trim(),
    cashAccount: form.cashAccount.trim(),
    openingHours: form.openingHours.trim(),
    notes: form.notes.trim(),
    status: form.status || 'active',
  }
}

export function warehouseOptions(branch, shop) {
  const fromBranch = (branch?.locations || []).filter((item) => item.type === 'warehouse')
  const shopBranchId = idOf(shop?.branchId)
  const loadedBranchId = branch?._id
  const sameBranch = !shop || !loadedBranchId || !shopBranchId || shopBranchId === loadedBranchId
  const fromShop = sameBranch
    ? [
        ...(shop?.warehouses || []),
        shop?.warehouseId && typeof shop.warehouseId === 'object' ? shop.warehouseId : null,
      ].filter(Boolean)
    : []
  const seen = new Set()

  return [...fromBranch, ...fromShop].flatMap((item) => {
    const value = item._id
    if (!value || seen.has(value)) return []
    seen.add(value)
    return [{ value, label: item.name || item.code || value }]
  })
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
