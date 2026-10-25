export const customerNote =
  'This receivable account links the customer to accounting. Saving this record does not post a voucher or create a balance. Receivable balances come from posted ledger entries; supplier payable accounts remain separate.'

export const customerAccountNote =
  'A party can be both customer and supplier. Balances derive from posted ledger entries, not manual balance edits.'

export const customerStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const paymentTermsOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'net_7', label: 'Net 7' },
  { value: 'net_14', label: 'Net 14' },
  { value: 'net_30', label: 'Net 30' },
]

export const apiFields = {
  code: 'code',
  name: 'name',
  contactName: 'contactName',
  phone: 'phone',
  email: 'email',
  address: 'address',
  currencyId: 'currencyId',
  creditLimit: 'creditLimit',
  paymentTerms: 'paymentTerms',
  receivableAccount: 'receivableAccount',
  status: 'status',
  notes: 'notes',
}

export const emptyCustomerForm = {
  code: '',
  name: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  currencyId: '',
  creditLimit: '',
  paymentTerms: '',
  receivableAccount: '',
  status: 'active',
  notes: '',
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

export function paymentTermsLabel(value, label) {
  if (label) return label
  const match = paymentTermsOptions.find((option) => option.value === value)
  return match?.label || titleFromValue(value)
}

export function currencyLabel(currency) {
  if (!currency) return ''
  if (typeof currency === 'string') return currency
  return currency.code || currency.name || currency.symbol || ''
}

export function currencyIdOf(customer) {
  return idOf(customer?.currencyId)
}

export function parseMoney(value) {
  const number = Number(String(value ?? '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(number) ? number : 0
}

export function numericText(value) {
  const text = String(value ?? '').replace(/[^\d.]/g, '')
  if (!text || text === '.') return ''
  return text
}

export function formatMoney(amount, currency = 'PKR') {
  if (amount == null || String(amount).trim() === '') return '—'
  const code = currency || 'PKR'
  return `${code} ${Math.round(parseMoney(amount)).toLocaleString('en-US')}`
}

export function moneyPlain(amount) {
  if (amount == null || String(amount).trim() === '') return '—'
  return Math.round(parseMoney(amount)).toLocaleString('en-US')
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

export function withOption(options, value, label) {
  if (!value || options.some((option) => option.value === value)) return options
  return [{ value, label: label || titleFromValue(value) }, ...options]
}

export function arApLabel(customer) {
  if (customer?.arApAccount?.label) return customer.arApAccount.label
  const ar = customer?.arApAccount?.ar || customer?.receivableAccount || ''
  const ap = customer?.arApAccount?.ap || ''
  if (ar && ap) return `${ar} / ${ap}`
  return ar || ap || ''
}

export function mapCustomer(customer) {
  const currency = currencyLabel(customer.currencyId)
  return {
    id: customer._id,
    code: customer.code || '',
    name: customer.name || '',
    contactName: customer.contactName || customer.contact || '',
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || '',
    currency,
    currencyId: currencyIdOf(customer),
    creditLimit: customer.creditLimit,
    availableCredit: customer.availableCredit,
    paymentTerms: customer.paymentTerms || '',
    paymentTermsLabel: paymentTermsLabel(customer.paymentTerms, customer.paymentTermsLabel),
    receivableAccount: customer.receivableAccount || '',
    receivableAccountId: customer.receivableAccountId || '',
    arApAccount: arApLabel(customer),
    status: statusText(customer),
    statusValue: customer.status || '',
    notes: customer.notes || '',
    postsLedger: customer.postsLedger,
    openingBalance: customer.openingBalance,
    outstanding: customer.outstanding,
    receivable: customer.receivable ?? customer.outstanding ?? 0,
    payable: customer.payable ?? 0,
    balanceNote: customer.balanceNote || '',
    ledgerPath: customer.ledgerPath || '',
    receivablesActivity: customer.receivablesActivity,
    createdOn: formatDate(customer.createdAt),
    updatedOn: formatDate(customer.updatedAt),
  }
}

export function formFromCustomer(customer) {
  return {
    code: customer.code || '',
    name: customer.name || '',
    contactName: customer.contactName || customer.contact || '',
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || '',
    currencyId: currencyIdOf(customer),
    creditLimit: numericText(customer.creditLimit),
    paymentTerms: customer.paymentTerms || '',
    receivableAccount: customer.receivableAccount || '',
    status: customer.status || 'active',
    notes: customer.notes || '',
  }
}

export function toCustomerBody(form) {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    contactName: form.contactName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    currencyId: form.currencyId,
    creditLimit: numericText(form.creditLimit) || '0',
    paymentTerms: form.paymentTerms,
    receivableAccount: form.receivableAccount.trim(),
    status: form.status || 'active',
    notes: form.notes.trim(),
  }
}

export function applyCustomerErrors(error, setErrors) {
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

export function validateCustomerForm(form) {
  const nextErrors = {}
  if (!form.code.trim()) nextErrors.code = 'Enter a customer code.'
  if (!form.name.trim()) nextErrors.name = 'Enter a customer name.'
  if (!form.currencyId) nextErrors.currencyId = 'Select a currency.'
  if (!form.paymentTerms) nextErrors.paymentTerms = 'Select payment terms.'
  if (!form.receivableAccount.trim()) nextErrors.receivableAccount = 'Enter a receivable account.'
  if (form.email.trim() && !form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
  return nextErrors
}
