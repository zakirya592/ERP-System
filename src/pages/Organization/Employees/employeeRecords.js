import { useSyncExternalStore } from 'react'

const seedCodes = ['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005']

export const employeeSummary =
  'Employment status and login status are separate. Deactivate access without deleting employee history.'

export const employeeAccess =
  'Identity, documents and payroll details are visible only to permitted HR roles.'

export const employeeBranches = ['Central Branch', 'North Branch', 'Airport Branch']

export const shopsByBranch = {
  'Central Branch': ['Central Shop', 'Market Shop', 'Riverside Shop'],
  'North Branch': ['North Shop'],
  'Airport Branch': ['Airport Outlet'],
}

export const warehousesByBranch = {
  'Central Branch': ['Main Warehouse', 'Market Warehouse'],
  'North Branch': ['North Warehouse'],
  'Airport Branch': ['Airport Warehouse'],
}

export const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Intern']
export const employmentStatuses = ['Active', 'On leave', 'Inactive']
export const erpRoles = ['Branch Manager', 'Shop Manager', 'Sales Officer', 'Cashier', 'Store Keeper', 'Warehouse Supervisor', 'Read only']
export const createLoginOptions = ['Enabled', 'Disabled']
export const loginStatuses = ['Enabled', 'Enabled pending', 'Disabled']

let addedEmployees = []
let employeeOverrides = {}
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener())
}

export function optionsForBranch(map, branch) {
  if (!branch) return [...new Set(Object.values(map).flat())]
  return map[branch] || []
}

export function buildAssignments(form, code, previous = []) {
  const items = []
  if (form.branch) {
    const existing = previous.find((item) => item.type === 'Branch' && item.location === form.branch)
    items.push(
      existing || {
        id: `${code}-branch`,
        location: form.branch,
        type: 'Branch',
        scope: 'Primary',
        accessRole: form.erpRole || form.jobTitle || 'Assigned',
        status: 'Active',
      },
    )
  }
  if (form.shop) {
    const existing = previous.find((item) => item.type === 'Shop' && item.location === form.shop)
    items.push(
      existing || {
        id: `${code}-shop`,
        location: form.shop,
        type: 'Shop',
        scope: 'Sales',
        accessRole: 'Sales + reports',
        status: 'Active',
      },
    )
  }
  if (form.warehouse) {
    const existing = previous.find((item) => item.type === 'Warehouse' && item.location === form.warehouse)
    items.push(
      existing || {
        id: `${code}-warehouse`,
        location: form.warehouse,
        type: 'Warehouse',
        scope: 'Stock',
        accessRole: 'Read only',
        status: 'Active',
      },
    )
  }
  return items
}

export function getAddedEmployees() {
  return addedEmployees
}

export function addEmployeeRecord(employee) {
  addedEmployees = [employee, ...addedEmployees]
  emit()
  return employee
}

export function getEmployeeOverrides() {
  return employeeOverrides
}

export function updateEmployeeRecord(employee) {
  const index = addedEmployees.findIndex((item) => item.id === employee.id)
  if (index >= 0) {
    addedEmployees = addedEmployees.map((item) => (item.id === employee.id ? employee : item))
  } else {
    employeeOverrides = { ...employeeOverrides, [employee.id]: employee }
  }
  emit()
  return employee
}

export function mergeEmployeeRegister(added = [], seed = [], overrides = employeeOverrides) {
  return [...added, ...seed].map((employee) =>
    overrides[employee.id] ? { ...employee, ...overrides[employee.id] } : employee,
  )
}

export function employeeCodeTaken(code, ignoreCode = '') {
  const value = String(code || '').trim().toLowerCase()
  const ignore = String(ignoreCode || '').trim().toLowerCase()
  if (!value || value === ignore) return false
  const overrideCodes = Object.values(employeeOverrides).map((employee) => employee.code)
  return (
    seedCodes.some((item) => item.toLowerCase() === value) ||
    addedEmployees.some((employee) => employee.code.toLowerCase() === value && employee.code.toLowerCase() !== ignore) ||
    overrideCodes.some((item) => String(item).toLowerCase() === value && String(item).toLowerCase() !== ignore)
  )
}

export function nextEmployeeCode() {
  let number = 1
  let code = 'EMP-001'
  while (employeeCodeTaken(code)) {
    number += 1
    code = `EMP-${String(number).padStart(3, '0')}`
  }
  return code
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAddedEmployees() {
  return useSyncExternalStore(subscribe, getAddedEmployees, getAddedEmployees)
}

export function useEmployeeOverrides() {
  return useSyncExternalStore(subscribe, getEmployeeOverrides, getEmployeeOverrides)
}
