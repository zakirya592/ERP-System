export const partnershipRule =
  'Each allocation column must total 100%. An agreement document and required approvals are needed before activation.'

export const partnershipAccess =
  'Ownership, profit allocation and loss allocation are maintained separately. Changes require a dated amendment.'

export const agreementTypes = [
  { value: 'operating_partnership', label: 'Operating partnership' },
  { value: 'distribution_venture', label: 'Distribution venture' },
  { value: 'retail_partnership', label: 'Retail partnership' },
]

export const partnershipStatuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const settlementFrequencies = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
]

export const apiFields = {
  name: 'name',
  code: 'code',
  agreementType: 'agreementType',
  branchId: 'branch',
  effectiveDate: 'effectiveDate',
  startDate: 'effectiveDate',
  reviewDate: 'endDate',
  capitalCommitment: 'capitalCommitment',
  settlementFrequency: 'distributionFrequency',
  managingPartner: 'managingPartner',
  partnerRoster: 'reviewOwner',
  profitAllocation: 'profitOwner',
  lossAllocation: 'lossOwner',
  approvalAuthority: 'approvalAuthority',
  notes: 'notes',
  status: 'status',
  partners: 'partners',
}

export function idOf(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id || ''
}

export function createdId(payload) {
  const data = payload?.data
  if (Array.isArray(data)) return data[0]?._id || ''
  return data?._id || ''
}

export function dateInput(value) {
  if (!value) return ''
  const text = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10)
  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function todayInput() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
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
  const value = String(status || '').toLowerCase().replace(/[_-]+/g, ' ')
  if (value === 'active') return 'bg-[#e7f8ee] text-[#1f9d57]'
  if (value === 'inactive') return 'bg-[#eef1f4] text-[#8b95a5]'
  if (value === 'review due') return 'bg-amber-50 text-amber-600'
  return 'bg-slate-100 text-slate-500'
}

export function withOption(options, value, label) {
  if (!value || options.some((option) => option.value === value)) return options
  return [{ value, label: label || titleFromValue(value) }, ...options]
}

export function branchNameOf(partnership) {
  const branch = partnership?.branchId
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

export function formatShare(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  const number = parseShare(text)
  const rounded = Math.round(number * 10) / 10
  return `${Number.isInteger(rounded) ? rounded : rounded}%`
}

export function formatPercent(value) {
  if (value == null || String(value).trim() === '') return '—'
  return formatShare(value)
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

export function allocationTotals(rows = []) {
  return {
    contribution: formatMoney(rows.reduce((total, row) => total + parseMoney(row.contribution), 0)),
    ownership: formatPercent(rows.reduce((total, row) => total + parseShare(row.ownership), 0)),
    profitShare: formatPercent(rows.reduce((total, row) => total + parseShare(row.profitShare), 0)),
    lossShare: formatPercent(rows.reduce((total, row) => total + parseShare(row.lossShare), 0)),
  }
}

export function allocationsBalanced(rows = []) {
  if (!rows.length) return false
  return ['ownership', 'profitShare', 'lossShare'].every((key) => {
    const total = rows.reduce((sum, row) => sum + parseShare(row[key]), 0)
    return Math.abs(total - 100) < 0.05
  })
}

export function summaryStats(summary) {
  if (!summary) {
    return { agreements: '—', active: '—', reviewDue: '—', activePartners: '—' }
  }
  return {
    agreements: summary.agreements?.total ?? '—',
    active: summary.agreements?.active ?? '—',
    reviewDue: summary.reviewDue ?? '—',
    activePartners: summary.activePartners ?? '—',
  }
}

export function emptyPartner() {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `partner-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ownerId: '',
    name: '',
    contribution: '',
    ownership: '',
    profitShare: '',
    lossShare: '',
  }
}

export function ownerNameOptions(owners, currentValues = []) {
  const options = owners.map((owner) => ({
    key: owner._id,
    value: owner.name,
    label: owner.name,
  }))
  currentValues.forEach((value) => {
    if (value && !options.some((option) => option.value === value)) {
      options.unshift({ key: `current-${value}`, value, label: value })
    }
  })
  return options
}

export function ownerIdOptions(owners, partners = []) {
  const options = owners.map((owner) => ({
    value: owner._id,
    label: owner.name,
  }))
  partners.forEach((partner) => {
    if (partner.ownerId && !options.some((option) => option.value === partner.ownerId)) {
      options.unshift({ value: partner.ownerId, label: partner.name || partner.ownerId })
    }
  })
  return options
}

function mapPartner(item, index) {
  return {
    id: item._id || `partner-${index}`,
    ownerId: idOf(item.ownerId),
    name: item.partnerName || '',
    contribution: displayMoney(item.contribution),
    ownership: formatPercent(item.ownership),
    profitShare: formatPercent(item.profitShare),
    lossShare: formatPercent(item.lossShare),
  }
}

function mapAllocation(allocation, partners = []) {
  if (allocation) {
    return {
      id: 'total',
      name: allocation.partner || 'Total',
      contribution: displayMoney(allocation.contribution),
      ownership: formatPercent(allocation.ownership),
      profitShare: formatPercent(allocation.profitShare),
      lossShare: formatPercent(allocation.lossShare),
    }
  }
  const totals = allocationTotals(partners)
  return { id: 'total', name: 'Total', ...totals }
}

export function mapPartnership(partnership) {
  const partners = (partnership.partners || []).map(mapPartner)
  return {
    id: partnership._id,
    code: partnership.code || '',
    name: partnership.name || '',
    agreementType: partnership.agreementTypeLabel || titleFromValue(partnership.agreementType),
    branch: branchNameOf(partnership),
    startDate: formatDate(partnership.startDate),
    endDate: partnership.reviewDate ? formatDate(partnership.reviewDate) : '',
    effectiveDate: formatDate(partnership.effectiveDate),
    status: statusText(partnership),
    statusValue: partnership.status || '',
    settlementFrequency: titleFromValue(partnership.settlementFrequency),
    capitalCommitment: displayMoney(partnership.capitalCommitment),
    managingPartner: partnership.managingPartner || '',
    reviewOwner: partnership.partnerRoster || '',
    profitOwner: partnership.profitAllocation || '',
    lossOwner: partnership.lossAllocation || '',
    approvalAuthority: partnership.approvalAuthority || '',
    notes: partnership.notes || '',
    governedBy: partnership.managingPartner || '',
    createdOn: formatDate(partnership.createdAt),
    updatedOn: formatDate(partnership.updatedAt),
    partners,
    allocations: partners.length ? [...partners, mapAllocation(partnership.allocation, partnership.partners)] : [],
  }
}

export function formFromPartnership(record) {
  return {
    name: record.name || '',
    code: record.code || '',
    agreementType: record.agreementType || '',
    branch: idOf(record.branchId),
    endDate: dateInput(record.reviewDate),
    effectiveDate: dateInput(record.effectiveDate || record.startDate),
    status: record.status || 'draft',
    distributionFrequency: record.settlementFrequency || '',
    capitalCommitment: numericText(record.capitalCommitment),
    managingPartner: record.managingPartner || '',
    reviewOwner: record.partnerRoster || '',
    profitOwner: record.profitAllocation || '',
    lossOwner: record.lossAllocation || '',
    approvalAuthority: record.approvalAuthority || '',
    notes: record.notes || '',
    partners: record.partners?.length
      ? record.partners.map((row, index) => ({
          id: row._id || `partner-${index}`,
          ownerId: idOf(row.ownerId),
          name: row.partnerName || '',
          contribution: numericText(row.contribution),
          ownership: numericText(row.ownership),
          profitShare: numericText(row.profitShare),
          lossShare: numericText(row.lossShare),
        }))
      : [emptyPartner()],
  }
}

function partnerBody(row) {
  const body = {
    ownerId: row.ownerId,
    partnerName: row.name,
    contribution: numericText(row.contribution),
    ownership: numericText(row.ownership),
    profitShare: numericText(row.profitShare),
    lossShare: numericText(row.lossShare),
  }
  if (row.id && !String(row.id).startsWith('partner-')) body._id = row.id
  return body
}

export function toPartnershipBody(form, status) {
  const effectiveDate = form.effectiveDate || null
  return {
    name: form.name.trim(),
    code: form.code.trim(),
    agreementType: form.agreementType,
    effectiveDate,
    startDate: effectiveDate,
    reviewDate: form.endDate || null,
    capitalCommitment: numericText(form.capitalCommitment),
    settlementFrequency: form.distributionFrequency,
    branchId: form.branch || null,
    managingPartner: form.managingPartner,
    partnerRoster: form.reviewOwner,
    profitAllocation: form.profitOwner,
    lossAllocation: form.lossOwner,
    approvalAuthority: form.approvalAuthority,
    notes: form.notes.trim(),
    status: status || form.status || 'draft',
    partners: form.partners.filter((row) => row.ownerId || row.name).map(partnerBody),
  }
}

export function applyPartnershipErrors(error, setErrors) {
  const apiErrors = error.response?.data?.errors
  if (!Array.isArray(apiErrors)) return
  const fieldErrors = {}
  apiErrors.forEach((item) => {
    const field = String(item.field || '')
    const root = field.split('.')[0]
    const key = apiFields[field] || apiFields[root] || root
    if (key && !fieldErrors[key]) fieldErrors[key] = item.message
  })
  setErrors((current) => ({ ...current, ...fieldErrors }))
}
