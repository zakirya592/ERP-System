import { useSyncExternalStore } from 'react'

const seedCodes = ['SH-001', 'SH-002', 'SH-003', 'SH-004', 'SH-005', 'SH-006', 'SH-007', 'SH-008']

let addedShops = []
let shopOverrides = {}
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener())
}

export function getAddedShops() {
  return addedShops
}

export function addShopRecord(shop) {
  addedShops = [shop, ...addedShops]
  emit()
  return shop
}

export function getShopOverrides() {
  return shopOverrides
}

export function updateShopRecord(shop) {
  const index = addedShops.findIndex((item) => item.id === shop.id)
  if (index >= 0) {
    addedShops = addedShops.map((item) => (item.id === shop.id ? shop : item))
  } else {
    shopOverrides = { ...shopOverrides, [shop.id]: shop }
  }
  emit()
  return shop
}

export function mergeShopRegister(added = [], seed = [], overrides = shopOverrides) {
  return [...added, ...seed].map((shop) => (overrides[shop.id] ? { ...shop, ...overrides[shop.id] } : shop))
}

export function shopCodeTaken(code, ignoreCode = '') {
  const value = String(code || '').trim().toLowerCase()
  const ignore = String(ignoreCode || '').trim().toLowerCase()
  if (!value || value === ignore) return false
  const overrideCodes = Object.values(shopOverrides).map((shop) => shop.code)
  return (
    seedCodes.some((item) => item.toLowerCase() === value) ||
    addedShops.some((shop) => shop.code.toLowerCase() === value && shop.code.toLowerCase() !== ignore) ||
    overrideCodes.some((item) => String(item).toLowerCase() === value && String(item).toLowerCase() !== ignore)
  )
}

export function nextShopCode() {
  let number = 1
  let code = 'SH-001'
  while (shopCodeTaken(code)) {
    number += 1
    code = `SH-${String(number).padStart(3, '0')}`
  }
  return code
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAddedShops() {
  return useSyncExternalStore(subscribe, getAddedShops, getAddedShops)
}

export function useShopOverrides() {
  return useSyncExternalStore(subscribe, getShopOverrides, getShopOverrides)
}
