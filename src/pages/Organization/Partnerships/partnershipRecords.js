import { useSyncExternalStore } from 'react'

export const partnershipRule =
  'Each allocation column must total 100%. An agreement document and required approvals are needed before activation.'

export const partnershipAccess =
  'Ownership, profit allocation and loss allocation are maintained separately. Changes require a dated amendment.'

export const agreementTypes = ['Operating partnership', 'Distribution venture', 'Retail partnership']
export const partnershipStatuses = ['Draft', 'Active', 'Review due', 'Inactive']
export const profitBases = ['% of net profit', 'Fixed amount', 'Revenue share']
export const lossBases = ['Same as profit share', 'Same as ownership', 'Custom']
export const reviewCycles = ['Monthly', 'Quarterly', 'Annually']
export const distributionFrequencies = ['Monthly', 'Quarterly', 'Annually']
export const branches = ['Central Branch', 'North Branch', 'Airport Shop']
export const people = ['Amina Rahman', 'Imran Khalid', 'Khalid Trading Ltd', 'Sara Iqbal', 'North Supplies Co']

const seedCodes = ['PT-001', 'PT-002', 'PT-003']

export const partnerships = [
  {
    id: 'PT-001',
    code: 'PT-001',
    name: 'Central Trading Partnership',
    agreementType: 'Operating partnership',
    branch: 'Central Branch',
    startDate: 'Jan 01, 2026',
    endDate: 'Dec 31, 2026',
    effectiveDate: 'Jan 01, 2026',
    status: 'Active',
    profitBasis: '% of net profit',
    lossBasis: 'Same as profit share',
    reviewCycle: 'Quarterly',
    distributionFrequency: 'Quarterly',
    capitalCommitment: 'PKR 10,000,000',
    minimumContribution: '',
    managingPartner: 'Amina Rahman',
    reviewOwner: 'Imran Khalid',
    profitOwner: 'Amina Rahman',
    lossOwner: 'Imran Khalid',
    approvalAuthority: 'Amina Rahman',
    partners: [
      partner('PT-001-amina', 'Amina Rahman', 'PKR 6,000,000', '60%', '60%', '60%'),
      partner('PT-001-khalid', 'Khalid Trading Ltd', 'PKR 4,000,000', '40%', '40%', '40%'),
    ],
    documentReference: 'DOC-2026-001',
    fileName: 'partnership-agreement-v1.pdf',
    notes: '',
    governedBy: 'Amina Rahman',
    createdOn: 'Jan 01, 2026',
    updatedOn: 'Sep 26, 2026',
  },
  {
    id: 'PT-002',
    code: 'PT-002',
    name: 'North Distribution JV',
    agreementType: 'Distribution venture',
    branch: 'North Branch',
    startDate: 'Mar 15, 2026',
    endDate: '',
    effectiveDate: 'Mar 15, 2026',
    status: 'Active',
    profitBasis: '% of net profit',
    lossBasis: 'Same as ownership',
    reviewCycle: 'Quarterly',
    distributionFrequency: 'Quarterly',
    capitalCommitment: 'PKR 6,000,000',
    minimumContribution: 'PKR 500,000',
    managingPartner: 'Sara Iqbal',
    reviewOwner: 'Imran Khalid',
    profitOwner: 'Sara Iqbal',
    lossOwner: 'North Supplies Co',
    approvalAuthority: 'Sara Iqbal',
    partners: [
      partner('PT-002-sara', 'Sara Iqbal', 'PKR 3,000,000', '50%', '50%', '50%'),
      partner('PT-002-north', 'North Supplies Co', 'PKR 3,000,000', '50%', '50%', '50%'),
    ],
    documentReference: 'DOC-2026-014',
    fileName: 'north-distribution-jv.pdf',
    notes: '',
    governedBy: 'Sara Iqbal',
    createdOn: 'Mar 15, 2026',
    updatedOn: 'Sep 18, 2026',
  },
  {
    id: 'PT-003',
    code: 'PT-003',
    name: 'Airport Retail Agreement',
    agreementType: 'Retail partnership',
    branch: 'Airport Shop',
    startDate: 'Jun 01, 2026',
    endDate: '',
    effectiveDate: 'Jun 01, 2026',
    status: 'Draft',
    profitBasis: '% of net profit',
    lossBasis: 'Same as profit share',
    reviewCycle: 'Monthly',
    distributionFrequency: 'Monthly',
    capitalCommitment: 'PKR 2,000,000',
    minimumContribution: '',
    managingPartner: 'Amina Rahman',
    reviewOwner: '',
    profitOwner: '',
    lossOwner: '',
    approvalAuthority: '',
    partners: [partner('PT-003-amina', 'Amina Rahman', 'PKR 2,000,000', '100%', '100%', '100%')],
    documentReference: '',
    fileName: '',
    notes: 'Waiting for the signed agreement.',
    governedBy: 'Amina Rahman',
    createdOn: 'Jun 01, 2026',
    updatedOn: 'Jun 01, 2026',
  },
]

function partner(id, name, contribution, ownership, profitShare, lossShare) {
  return { id, name, contribution, ownership, profitShare, lossShare }
}

let addedPartnerships = []
let partnershipOverrides = {}
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener())
}

export function parseShare(value) {
  const number = Number(String(value ?? '').replace('%', '').replace(/,/g, '').trim())
  return Number.isFinite(number) ? number : 0
}

export function formatShare(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  const number = parseShare(text)
  const rounded = Math.round(number * 10) / 10
  return `${Number.isInteger(rounded) ? rounded : rounded}%`
}

export function parseMoney(value) {
  const number = Number(String(value ?? '').replace(/[^\d.]/g, ''))
  return Number.isFinite(number) ? number : 0
}

export function formatMoney(amount) {
  return `PKR ${Math.round(amount).toLocaleString('en-US')}`
}

export function formatPercent(number) {
  const rounded = Math.round(number * 10) / 10
  return `${Number.isInteger(rounded) ? rounded : rounded}%`
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
  const totals = allocationTotals(rows)
  return totals.ownership === '100%' && totals.profitShare === '100%' && totals.lossShare === '100%'
}

export function partnershipStats(register) {
  const active = register.filter((item) => item.status === 'Active')
  const names = new Set(active.flatMap((item) => item.partners.map((row) => row.name).filter(Boolean)))
  return {
    agreements: register.length,
    active: active.length,
    reviewDue: register.filter((item) => item.status === 'Draft' || item.status === 'Review due').length,
    activePartners: names.size,
  }
}

export function displayValue(value, empty = 'Not recorded') {
  const text = String(value ?? '').trim()
  return text || empty
}

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function todayInput() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function toDateInput(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10)
  const match = text.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/)
  if (!match) return ''
  const month = monthLabels.findIndex((label) => label.toLowerCase() === match[1].toLowerCase())
  if (month < 0) return ''
  return `${match[3]}-${String(month + 1).padStart(2, '0')}-${match[2].padStart(2, '0')}`
}

export function formatDisplayDate(value) {
  const input = toDateInput(value)
  if (!input) return String(value ?? '').trim()
  const [year, month, day] = input.split('-')
  return `${monthLabels[Number(month) - 1]} ${day}, ${year}`
}

export function getAddedPartnerships() {
  return addedPartnerships
}

export function getPartnershipOverrides() {
  return partnershipOverrides
}

export function addPartnershipRecord(record) {
  addedPartnerships = [record, ...addedPartnerships]
  emit()
  return record
}

export function updatePartnershipRecord(record) {
  const index = addedPartnerships.findIndex((item) => item.id === record.id)
  if (index >= 0) {
    addedPartnerships = addedPartnerships.map((item) => (item.id === record.id ? record : item))
  } else {
    partnershipOverrides = { ...partnershipOverrides, [record.id]: record }
  }
  emit()
  return record
}

export function mergePartnershipRegister(added = [], seed = partnerships, overrides = partnershipOverrides) {
  return [...added, ...seed].map((item) => (overrides[item.id] ? { ...item, ...overrides[item.id] } : item))
}

export function partnershipCodeTaken(code, ignoreCode = '') {
  const value = String(code || '').trim().toLowerCase()
  const ignore = String(ignoreCode || '').trim().toLowerCase()
  if (!value || value === ignore) return false
  const overrideCodes = Object.values(partnershipOverrides).map((item) => item.code)
  return (
    seedCodes.some((item) => item.toLowerCase() === value) ||
    addedPartnerships.some((item) => item.code.toLowerCase() === value && item.code.toLowerCase() !== ignore) ||
    overrideCodes.some((item) => String(item).toLowerCase() === value && String(item).toLowerCase() !== ignore)
  )
}

export function nextPartnershipCode() {
  let number = 1
  let code = 'PT-001'
  while (partnershipCodeTaken(code)) {
    number += 1
    code = `PT-${String(number).padStart(3, '0')}`
  }
  return code
}

export function emptyPartner() {
  return { id: `partner-${Date.now()}-${Math.random().toString(16).slice(2)}`, name: '', contribution: '', ownership: '', profitShare: '', lossShare: '' }
}

export function partnershipToForm(record) {
  return {
    name: record.name || '',
    code: record.code || '',
    agreementType: record.agreementType || '',
    branch: record.branch || '',
    startDate: toDateInput(record.startDate),
    endDate: toDateInput(record.endDate),
    effectiveDate: toDateInput(record.effectiveDate),
    status: record.status || 'Draft',
    profitBasis: record.profitBasis || '',
    lossBasis: record.lossBasis || '',
    reviewCycle: record.reviewCycle || '',
    distributionFrequency: record.distributionFrequency || '',
    capitalCommitment: record.capitalCommitment || '',
    minimumContribution: record.minimumContribution || '',
    managingPartner: record.managingPartner || '',
    reviewOwner: record.reviewOwner || '',
    profitOwner: record.profitOwner || '',
    lossOwner: record.lossOwner || '',
    approvalAuthority: record.approvalAuthority || '',
    documentReference: record.documentReference || '',
    fileName: record.fileName || '',
    notes: record.notes || '',
    partners: record.partners?.length ? record.partners.map((row) => ({ ...row })) : [emptyPartner()],
  }
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAddedPartnerships() {
  return useSyncExternalStore(subscribe, getAddedPartnerships, getAddedPartnerships)
}

export function usePartnershipOverrides() {
  return useSyncExternalStore(subscribe, getPartnershipOverrides, getPartnershipOverrides)
}
