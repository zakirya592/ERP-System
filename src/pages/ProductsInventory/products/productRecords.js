export const emptyProductForm = {
  sku: '',
  name: '',
  barcode: '',
  categoryId: '',
  description: '',
  quantityUnitId: '',
  packingUnitId: '',
  costPrice: '',
  salePrice: '',
  reorderLevel: '',
  trackBatch: false,
  trackExpiry: false,
  status: 'active',
}

export function refId(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id || ''
}

export function refName(value) {
  if (!value || typeof value === 'string') return ''
  return value.name || ''
}

export function unitLabel(value) {
  if (!value || typeof value === 'string') return value || '—'
  if (value.shortCode) return `${value.name} (${value.shortCode})`
  return value.name || '—'
}

export function money(value) {
  const amount = Number(value)
  if (value == null || value === '' || Number.isNaN(amount)) return '—'
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function statusLabel(status) {
  if (!status) return '—'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function formatWhen(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function productToForm(product) {
  return {
    sku: product.sku || '',
    name: product.name || '',
    barcode: product.barcode || '',
    categoryId: refId(product.categoryId),
    description: product.description || '',
    quantityUnitId: refId(product.quantityUnitId),
    packingUnitId: refId(product.packingUnitId),
    costPrice: product.costPrice == null ? '' : String(product.costPrice),
    salePrice: product.salePrice == null ? '' : String(product.salePrice),
    reorderLevel: product.reorderLevel == null ? '' : String(product.reorderLevel),
    trackBatch: Boolean(product.trackBatch),
    trackExpiry: Boolean(product.trackExpiry),
    status: product.status || 'active',
  }
}

export function validateProductForm(form) {
  const nextErrors = {}

  if (!form.sku.trim()) nextErrors.sku = 'Enter a SKU.'
  if (!form.name.trim()) nextErrors.name = 'Enter a product name.'
  if (!form.categoryId) nextErrors.categoryId = 'Select a category.'
  if (!form.quantityUnitId) nextErrors.quantityUnitId = 'Select a quantity unit.'
  if (!isMoney(form.costPrice)) nextErrors.costPrice = 'Enter a cost price.'
  if (!isMoney(form.salePrice)) nextErrors.salePrice = 'Enter a sale price.'
  if (!isQuantity(form.reorderLevel)) nextErrors.reorderLevel = 'Enter a reorder level.'

  return nextErrors
}

export function productPayload(form) {
  return {
    categoryId: form.categoryId,
    sku: form.sku.trim(),
    name: form.name.trim(),
    barcode: form.barcode.trim() || null,
    description: form.description.trim(),
    quantityUnitId: form.quantityUnitId,
    packingUnitId: form.packingUnitId || null,
    costPrice: decimalString(form.costPrice),
    salePrice: decimalString(form.salePrice),
    reorderLevel: decimalString(form.reorderLevel),
    trackBatch: Boolean(form.trackBatch),
    trackExpiry: Boolean(form.trackBatch && form.trackExpiry),
    status: form.status,
  }
}

export function applyApiErrors(error, setErrors) {
  const apiErrors = error.response?.data?.errors
  if (!Array.isArray(apiErrors)) return
  const fieldErrors = {}
  apiErrors.forEach((item) => {
    if (item.field && !fieldErrors[item.field]) fieldErrors[item.field] = item.message
  })
  setErrors((current) => ({ ...current, ...fieldErrors }))
}

export function withCurrentOption(options, record, label) {
  const id = refId(record)
  if (!id || options.some((option) => option.value === id)) return options
  return [{ value: id, label: label(record) }, ...options]
}

function decimalString(value) {
  return String(value).replace(/,/g, '').trim()
}

function isMoney(value) {
  const amount = decimalString(value)
  return amount !== '' && /^\d+(\.\d+)?$/.test(amount)
}

function isQuantity(value) {
  const amount = decimalString(value)
  return amount !== '' && /^\d+(\.\d+)?$/.test(amount)
}
