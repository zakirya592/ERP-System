export const ownerSummary =
  'Effective ownership must total 100%. Record changes with an effective date and retain previous ownership history.'

export const ownerAccess = 'Owner status does not automatically grant ERP access or signing authority.'

export const ownerTypes = [
  { value: 'individual', label: 'Individual' },
  { value: 'corporate', label: 'Corporate' },
]

export const ownerStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const apiFields = {
  name: 'name',
  code: 'code',
  ownerType: 'ownerType',
  identityNo: 'identityNo',
  email: 'email',
  phone: 'phone',
  address: 'address',
  countryOfRegistration: 'country',
  branchId: 'branchId',
  ownershipPercentage: 'share',
  capitalCommitment: 'capitalCommitment',
  effectiveDate: 'effectiveDate',
  capitalAccount: 'capitalAccount',
  authorizedSignatory: 'signatory',
  notes: 'notes',
  status: 'status',
}

export function idOf(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id || ''
}

export function dateInput(value) {
  if (!value) return ''
  const text = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10)
  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
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

export function branchNameOf(owner) {
  const branch = owner?.branchId
  if (branch && typeof branch === 'object') return branch.name || branch.code || ''
  return ''
}

export function parseShare(value) {
  const number = Number(String(value ?? '').replace('%', '').replace(/,/g, '').trim())
  return Number.isFinite(number) ? number : 0
}

export function numericText(value) {
  const text = String(value ?? '').replace(/[^\d.]/g, '')
  if (!text || text === '.') return ''
  return text
}

export function formatPercent(value) {
  if (value == null || String(value).trim() === '') return '—'
  const number = parseShare(value)
  const rounded = Math.round(number * 10) / 10
  const shown = Number.isInteger(rounded) ? String(rounded) : String(rounded)
  return `${shown}%`
}

export function parseMoney(value) {
  const number = Number(String(value ?? '').replace(/[^\d.]/g, ''))
  return Number.isFinite(number) ? number : 0
}

export function formatMoney(amount) {
  return `PKR ${Math.round(parseMoney(amount)).toLocaleString('en-US')}`
}

export function displayMoney(value) {
  if (value == null || String(value).trim() === '') return '—'
  return formatMoney(value)
}

export function formatPledged(amount) {
  const value = parseMoney(amount)
  if (value >= 1000000) {
    const millions = value / 1000000
    const shown = Number.isInteger(millions) ? String(millions) : millions.toFixed(1)
    return `PKR ${shown}m`
  }
  return formatMoney(value)
}

export function allocationMessage(percent) {
  const shown = formatPercent(percent)
  return `Current allocation is ${shown}. Adjust effective ownership before adding an additional claim.`
}

function mapInterest(item, index) {
  return {
    id: item._id || `interest-${index}`,
    entity: item.entity || '',
    share: formatPercent(item.share),
    committed: displayMoney(item.committed),
    paidIn: displayMoney(item.paidIn),
    effectiveDate: item.effectiveDate ? formatDate(item.effectiveDate) : '—',
  }
}

function mapAllocation(allocation) {
  if (!allocation) return null
  return {
    id: 'total-allocated',
    entity: allocation.entity || 'Total allocated',
    share: formatPercent(allocation.share),
    committed: displayMoney(allocation.committed),
    paidIn: displayMoney(allocation.paidIn),
    effectiveDate: allocation.effectiveLabel || formatDate(allocation.effectiveDate),
  }
}

export function mapOwner(owner) {
  const interests = (owner.interests || []).map(mapInterest)
  const allocation = mapAllocation(owner.allocation)
  return {
    id: owner._id,
    code: owner.code || '',
    name: owner.name || '',
    type: owner.ownerTypeLabel || titleFromValue(owner.ownerType),
    identity: owner.identityNo || '',
    email: owner.email || '',
    phone: owner.phone || '',
    address: owner.address || '',
    country: owner.countryOfRegistration || '',
    share: formatPercent(owner.ownershipPercentage),
    capitalCommitment: displayMoney(owner.capitalCommitment),
    effectiveDate: formatDate(owner.effectiveDate),
    capitalAccount: owner.capitalAccount || '',
    signatory: owner.authorizedSignatory || '',
    status: statusText(owner),
    statusValue: owner.status || '',
    branch: branchNameOf(owner),
    notes: owner.notes || '',
    createdOn: formatDate(owner.createdAt),
    updatedOn: formatDate(owner.updatedAt),
    summary: ownerSummary,
    access: ownerAccess,
    interests: allocation ? [...interests, allocation] : interests,
  }
}

export function formFromOwner(owner) {
  return {
    name: owner.name || '',
    code: owner.code || '',
    ownerType: owner.ownerType || '',
    identityNo: owner.identityNo || '',
    email: owner.email || '',
    phone: owner.phone || '',
    address: owner.address || '',
    country: owner.countryOfRegistration || '',
    branchId: idOf(owner.branchId),
    share: numericText(owner.ownershipPercentage),
    capitalCommitment: numericText(owner.capitalCommitment),
    effectiveDate: dateInput(owner.effectiveDate),
    capitalAccount: owner.capitalAccount || '',
    signatory: owner.authorizedSignatory || '',
    status: owner.status || 'active',
    notes: owner.notes || '',
  }
}

function interestBody(item) {
  return {
    entity: item.entity || '',
    share: numericText(item.share),
    committed: numericText(item.committed),
    paidIn: numericText(item.paidIn),
    effectiveDate: dateInput(item.effectiveDate),
  }
}

export function toOwnerBody(form, existingInterests = []) {
  const share = numericText(form.share)
  const committed = numericText(form.capitalCommitment)
  const effectiveDate = form.effectiveDate || ''
  let interests = existingInterests.map(interestBody).filter((item) => item.entity)

  if (interests.length === 1) {
    interests = [
      {
        ...interests[0],
        share: share || interests[0].share,
        committed: committed || interests[0].committed,
        effectiveDate: effectiveDate || interests[0].effectiveDate,
      },
    ]
  }

  return {
    name: form.name.trim(),
    code: form.code.trim(),
    ownerType: form.ownerType,
    identityNo: form.identityNo.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    countryOfRegistration: form.country.trim(),
    branchId: form.branchId,
    ownershipPercentage: share,
    capitalCommitment: committed,
    effectiveDate,
    capitalAccount: form.capitalAccount.trim(),
    authorizedSignatory: form.signatory.trim(),
    notes: form.notes.trim(),
    status: form.status || 'active',
    ...(interests.length ? { interests } : {}),
  }
}

export function applyOwnerErrors(error, setErrors) {
  const apiErrors = error.response?.data?.errors
  if (!Array.isArray(apiErrors)) return
  const fieldErrors = {}
  apiErrors.forEach((item) => {
    const field = String(item.field || '')
    const key = field.startsWith('interests') ? 'share' : apiFields[field] || field
    if (key && !fieldErrors[key]) fieldErrors[key] = item.message
  })
  setErrors((current) => ({ ...current, ...fieldErrors }))
}
