import { useSyncExternalStore } from 'react'

const seedCodes = ['OWN-001', 'OWN-002']

export const ownerSummary =
  'Effective ownership must total 100%. Record changes with an effective date and retain previous ownership history.'

export const ownerAccess = 'Owner status does not automatically grant ERP access or signing authority.'

export const ownerTypes = ['Individual', 'Corporate']
export const ownerStatuses = ['Active', 'Inactive']

let addedOwners = []
let ownerOverrides = {}
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
  const shown = Number.isInteger(rounded) ? String(rounded) : String(rounded)
  return `${shown}%`
}

export function parseMoney(value) {
  const number = Number(String(value ?? '').replace(/[^\d.]/g, ''))
  return Number.isFinite(number) ? number : 0
}

export function formatMoney(amount) {
  return `PKR ${Math.round(amount).toLocaleString('en-US')}`
}

export function formatPledged(amount) {
  if (amount >= 1000000) {
    const millions = amount / 1000000
    const shown = Number.isInteger(millions) ? String(millions) : millions.toFixed(1)
    return `PKR ${shown}m`
  }
  return formatMoney(amount)
}

export function formatPercent(number) {
  const rounded = Math.round(number * 10) / 10
  const shown = Number.isInteger(rounded) ? String(rounded) : String(rounded)
  return `${shown}%`
}

export function allocationMessage(percent) {
  if (percent >= 100) {
    return 'Current allocation is 100%. Adjust effective ownership before adding an additional claim.'
  }
  return `Current allocation is ${formatPercent(percent)}. Adjust effective ownership before adding an additional claim.`
}

export function allocatedShare(owners, ignoreId = '') {
  return owners
    .filter((owner) => owner.id !== ignoreId)
    .reduce((total, owner) => total + parseShare(owner.share), 0)
}

export function buildInterests(form, code, previous = []) {
  const share = formatShare(form.share)
  const committed = String(form.capitalCommitment || '').trim()
  if (!share && !committed) return previous
  const existing = previous[0]
  const interest = {
    id: existing?.id || `${code}-interest`,
    entity: existing?.entity || 'Central Trading',
    share: share || existing?.share || '',
    committed: committed || existing?.committed || '',
    paidIn: existing?.paidIn && existing.paidIn !== '—' ? existing.paidIn : existing?.paidIn || '—',
    effectiveDate: String(form.effectiveDate || '').trim() || existing?.effectiveDate || 'Current',
  }
  return [interest, ...previous.slice(1)]
}

export function getAddedOwners() {
  return addedOwners
}

export function addOwnerRecord(owner) {
  addedOwners = [owner, ...addedOwners]
  emit()
  return owner
}

export function getOwnerOverrides() {
  return ownerOverrides
}

export function updateOwnerRecord(owner) {
  const index = addedOwners.findIndex((item) => item.id === owner.id)
  if (index >= 0) {
    addedOwners = addedOwners.map((item) => (item.id === owner.id ? owner : item))
  } else {
    ownerOverrides = { ...ownerOverrides, [owner.id]: owner }
  }
  emit()
  return owner
}

export function mergeOwnerRegister(added = [], seed = [], overrides = ownerOverrides) {
  return [...added, ...seed].map((owner) => (overrides[owner.id] ? { ...owner, ...overrides[owner.id] } : owner))
}

export function ownerCodeTaken(code, ignoreCode = '') {
  const value = String(code || '').trim().toLowerCase()
  const ignore = String(ignoreCode || '').trim().toLowerCase()
  if (!value || value === ignore) return false
  const overrideCodes = Object.values(ownerOverrides).map((owner) => owner.code)
  return (
    seedCodes.some((item) => item.toLowerCase() === value) ||
    addedOwners.some((owner) => owner.code.toLowerCase() === value && owner.code.toLowerCase() !== ignore) ||
    overrideCodes.some((item) => String(item).toLowerCase() === value && String(item).toLowerCase() !== ignore)
  )
}

export function nextOwnerCode() {
  let number = 1
  let code = 'OWN-001'
  while (ownerCodeTaken(code)) {
    number += 1
    code = `OWN-${String(number).padStart(3, '0')}`
  }
  return code
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAddedOwners() {
  return useSyncExternalStore(subscribe, getAddedOwners, getAddedOwners)
}

export function useOwnerOverrides() {
  return useSyncExternalStore(subscribe, getOwnerOverrides, getOwnerOverrides)
}
