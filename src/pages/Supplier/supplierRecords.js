export const paymentTermsOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'net_7', label: 'Net 7' },
  { value: 'net_14', label: 'Net 14' },
  { value: 'net_30', label: 'Net 30' },
]

export const supplierStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const statusFilterOptions = [
  { label: 'All statuses', value: '' },
  ...supplierStatuses,
]

export const paymentTermsFilterOptions = [
  { label: 'All payment terms', value: '' },
  ...paymentTermsOptions,
]

const apiFields = {
  code: 'code',
  name: 'name',
  phone: 'phone',
  email: 'email',
  address: 'address',
  currencyId: 'currencyId',
  paymentTerms: 'paymentTerms',
  payableAccount: 'payableAccount',
  status: 'status',
  notes: 'notes',
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

export function titleFromValue(value) {
  const text = String(value || '')
    .replace(/[_-]+/g, ' ')
    .trim()
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
  if (value === 'active') return 'bg-emerald-50 text-emerald-600'
  if (value === 'inactive') return 'bg-slate-100 text-slate-500'
  return 'bg-slate-100 text-slate-500'
}

export function money(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '0'
  return number.toLocaleString('en-US')
}

export function moneyLabel(value, currency = 'PKR') {
  return `${currency} ${money(value)}`
}

export function formatAsOf(value) {
  if (!value) return '—'
  const text = String(value)
  const date = /^\d{4}-\d{2}-\d{2}/.test(text)
    ? new Date(`${text.slice(0, 10)}T00:00:00`)
    : new Date(text)
  if (Number.isNaN(date.getTime())) return display(value)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
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

export function currencyOf(supplier) {
  const currency = supplier?.currencyId
  if (currency && typeof currency === 'object') {
    return {
      id: currency._id || '',
      code: currency.code || currency.name || '',
      name: currency.name || currency.code || '',
      symbol: currency.symbol || '',
    }
  }
  return { id: idOf(currency), code: '', name: '', symbol: '' }
}

export function paymentTermsLabelOf(supplier) {
  if (supplier?.paymentTermsLabel) return supplier.paymentTermsLabel
  const match = paymentTermsOptions.find((option) => option.value === supplier?.paymentTerms)
  return match?.label || titleFromValue(supplier?.paymentTerms)
}

function mapBill(item, index) {
  const id = item.code || item.reference || item.number || item._id || `bill-${index}`
  const amount = Number(item.amount ?? item.total ?? 0) || 0
  const paid = Number(item.paid ?? item.paidAmount ?? 0) || 0
  const balance = Number(item.balance ?? item.outstanding ?? amount - paid) || 0
  return {
    id,
    date: formatDate(item.dueDate || item.date || item.dueOn),
    amount,
    paid,
    balance,
  }
}

function mapNextDue(ledger = []) {
  const open = ledger.find((item) => Number(item.balance ?? item.outstanding ?? 0) > 0)
  if (!open) return null
  return {
    id: open.code || open.reference || open.number || open._id || '—',
    date: formatDate(open.dueDate || open.date || open.dueOn),
    amount: Number(open.balance ?? open.outstanding ?? open.amount ?? 0) || 0,
  }
}

function mapAllocation(allocation) {
  if (!allocation) return null
  const id = allocation.code || allocation.reference || allocation._id || 'Allocation'
  const amount = Number(allocation.amount ?? allocation.allocated ?? 0) || 0
  const detail =
    allocation.detail ||
    allocation.note ||
    allocation.description ||
    [allocation.bank, allocation.date && formatDate(allocation.date), allocation.journal]
      .filter(Boolean)
      .join(' · ')
  return { id, amount, detail: detail || 'Allocation applied to open purchases.' }
}

export function mapSupplier(supplier) {
  const currency = currencyOf(supplier)
  const activity = supplier.payablesActivity || {}
  const ledger = activity.purchaseLedger || supplier.purchaseLedger || []
  const outstanding =
    Number(activity.outstanding ?? supplier.outstanding ?? supplier.payables ?? 0) || 0

  return {
    id: supplier._id,
    code: supplier.code || '',
    name: supplier.name || '',
    contact: supplier.name || '',
    phone: supplier.phone || '',
    email: supplier.email || '',
    companyEmail: supplier.email || '',
    address: supplier.address || '',
    currency: currency.code || 'PKR',
    currencyId: currency.id,
    account: supplier.payableAccount || supplier.payableAccountId || '',
    terms: paymentTermsLabelOf(supplier),
    paymentTerms: supplier.paymentTerms || '',
    outstanding,
    current: Number(activity.current ?? outstanding) || 0,
    overdue: Number(activity.overdue ?? 0) || 0,
    unallocated: Number(activity.unallocatedAdvance ?? 0) || 0,
    status: statusText(supplier),
    statusValue: supplier.status || '',
    notes: supplier.notes || '',
    balanceNote: supplier.balanceNote || '',
    postsLedger: Boolean(supplier.postsLedger),
    openingBalance: Number(supplier.openingBalance ?? 0) || 0,
    nextDue: mapNextDue(ledger),
    allocation: mapAllocation(activity.latestAllocation || supplier.latestAllocation),
    bills: ledger.map(mapBill),
    createdOn: formatDate(supplier.createdAt),
    updatedOn: formatDate(supplier.updatedAt),
  }
}

export function formFromSupplier(supplier) {
  return {
    code: supplier.code || '',
    name: supplier.name || '',
    phone: supplier.phone || '',
    email: supplier.email || '',
    address: supplier.address || '',
    currencyId: idOf(supplier.currencyId),
    paymentTerms: supplier.paymentTerms || '',
    payableAccount: supplier.payableAccount || '',
    status: supplier.status || 'active',
    notes: supplier.notes || '',
  }
}

export function toSupplierBody(form) {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    currencyId: form.currencyId,
    paymentTerms: form.paymentTerms,
    payableAccount: form.payableAccount.trim(),
    status: form.status || 'active',
    notes: (form.notes || '').trim(),
  }
}

export function applySupplierErrors(error, setErrors) {
  const apiErrors = error.response?.data?.errors
  if (!Array.isArray(apiErrors)) return
  const fieldErrors = {}
  apiErrors.forEach((item) => {
    const field = String(item.field || '')
    const key = apiFields[field] || field
    if (key && !fieldErrors[key]) fieldErrors[key] = item.message
  })
  setErrors((current) => ({ ...current, ...fieldErrors }))
}

export function withOption(options, value, label) {
  if (!value || options.some((option) => option.value === value)) return options
  return [{ value, label: label || titleFromValue(value) }, ...options]
}

export const emptySupplierForm = {
  code: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  currencyId: '',
  paymentTerms: '',
  payableAccount: '',
  status: 'active',
  notes: '',
}
