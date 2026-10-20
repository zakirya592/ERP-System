import { useSyncExternalStore } from 'react'

const seedCodes = ['WH-001', 'WH-002', 'WH-003', 'WH-004', 'WH-005']

let addedWarehouses = []
let warehouseOverrides = {}
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener())
}

export function getAddedWarehouses() {
  return addedWarehouses
}

export function addWarehouseRecord(warehouse) {
  addedWarehouses = [warehouse, ...addedWarehouses]
  emit()
  return warehouse
}

export function getWarehouseOverrides() {
  return warehouseOverrides
}

export function updateWarehouseRecord(warehouse) {
  const index = addedWarehouses.findIndex((item) => item.id === warehouse.id)
  if (index >= 0) {
    addedWarehouses = addedWarehouses.map((item) => (item.id === warehouse.id ? warehouse : item))
  } else {
    warehouseOverrides = { ...warehouseOverrides, [warehouse.id]: warehouse }
  }
  emit()
  return warehouse
}

export function mergeWarehouseRegister(added = [], seed = [], overrides = warehouseOverrides) {
  return [...added, ...seed].map((warehouse) =>
    overrides[warehouse.id] ? { ...warehouse, ...overrides[warehouse.id] } : warehouse,
  )
}

export function warehouseCodeTaken(code, ignoreCode = '') {
  const value = String(code || '').trim().toLowerCase()
  const ignore = String(ignoreCode || '').trim().toLowerCase()
  if (!value || value === ignore) return false
  const overrideCodes = Object.values(warehouseOverrides).map((warehouse) => warehouse.code)
  return (
    seedCodes.some((item) => item.toLowerCase() === value) ||
    addedWarehouses.some((warehouse) => warehouse.code.toLowerCase() === value && warehouse.code.toLowerCase() !== ignore) ||
    overrideCodes.some((item) => String(item).toLowerCase() === value && String(item).toLowerCase() !== ignore)
  )
}

export function nextWarehouseCode() {
  let number = 1
  let code = 'WH-001'
  while (warehouseCodeTaken(code)) {
    number += 1
    code = `WH-${String(number).padStart(3, '0')}`
  }
  return code
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAddedWarehouses() {
  return useSyncExternalStore(subscribe, getAddedWarehouses, getAddedWarehouses)
}

export function useWarehouseOverrides() {
  return useSyncExternalStore(subscribe, getWarehouseOverrides, getWarehouseOverrides)
}
