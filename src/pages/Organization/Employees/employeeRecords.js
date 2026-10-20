export const employeeSummary =
  'Employment status and login status are separate. Deactivate access without deleting employee history.'

export const employeeAccess =
  'Identity, documents and payroll details are visible only to permitted HR roles.'

export const employmentTypes = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
]

export const employmentStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On leave' },
  { value: 'inactive', label: 'Inactive' },
]

export const erpRoles = [
  { value: 'branch_manager', label: 'Branch Manager' },
  { value: 'shop_manager', label: 'Shop Manager' },
  { value: 'sales_officer', label: 'Sales Officer' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'store_keeper', label: 'Store Keeper' },
  { value: 'warehouse_supervisor', label: 'Warehouse Supervisor' },
  { value: 'read_only', label: 'Read only' },
]

export const createLoginOptions = [
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
]

export const apiFields = {
  branchId: 'branchId',
  shopAssignment: 'shopAssignment',
  warehouseAccess: 'warehouseAccess',
  employmentType: 'employmentType',
  jobTitle: 'jobTitle',
  joiningDate: 'joiningDate',
  reportsTo: 'reportsTo',
  erpRole: 'erpRole',
  createLogin: 'createLogin',
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
  if (value === 'active' || value === 'enabled') return 'bg-[#e7f8ee] text-[#1f9d57]'
  if (value.includes('leave')) return 'bg-[#eef1f4] text-[#6b7280]'
  if (value === 'inactive' || value === 'disabled') return 'bg-[#eef1f4] text-[#8b95a5]'
  if (value.includes('pending')) return 'bg-[#fff7e8] text-[#b7791f]'
  return 'bg-slate-100 text-slate-500'
}

export function withOption(options, value, label) {
  if (!value || options.some((option) => option.value === value)) return options
  return [{ value, label: label || titleFromValue(value) }, ...options]
}

export function branchNameOf(employee) {
  const branch = employee?.branchId
  if (branch && typeof branch === 'object') return branch.name || branch.code || ''
  const assignment = (employee?.assignments || []).find(
    (item) => item.locationType === 'branch' && (item.scope === 'primary' || !item.scope),
  )
  return assignment?.locationName || ''
}

export function mapAssignment(item, index) {
  return {
    id: item._id || `${item.locationType || 'location'}-${index}`,
    location: item.locationName || '',
    type: item.locationTypeLabel || titleFromValue(item.locationType),
    scope: item.scopeLabel || titleFromValue(item.scope),
    accessRole: item.accessRoleLabel || titleFromValue(item.accessRole),
    status: item.statusLabel || titleFromValue(item.status),
  }
}

export function mapEmployee(employee) {
  return {
    id: employee._id,
    code: employee.code || '',
    name: employee.name || '',
    email: employee.email || '',
    phone: employee.phone || '',
    department: employee.department || '',
    jobTitle: employee.jobTitle || '',
    employmentType: employee.employmentTypeLabel || titleFromValue(employee.employmentType),
    joiningDate: formatDate(employee.joiningDate),
    reportsTo: employee.reportsTo || '',
    status: statusText(employee),
    statusValue: employee.status || '',
    branch: branchNameOf(employee),
    branchId: idOf(employee.branchId),
    shop: employee.shopAssignment || '',
    warehouse: employee.warehouseAccess || '',
    erpRole: employee.erpRoleLabel || titleFromValue(employee.erpRole),
    createLogin: employee.createLogin ? titleFromValue(employee.createLogin) : '',
    loginStatus: employee.loginStatusLabel || (employee.loginStatus ? titleFromValue(employee.loginStatus) : ''),
    notes: employee.notes || '',
    documentType: employee.document?.type || '',
    documentReference: employee.document?.reference || '',
    fileName: employee.document?.fileName || '',
    createdOn: formatDate(employee.createdAt),
    updatedOn: formatDate(employee.updatedAt),
    assignments: (employee.assignments || []).map(mapAssignment),
  }
}

function normalizeCreateLogin(value) {
  const text = String(value || '').trim().toLowerCase()
  if (!text) return ''
  if (text === 'enabled' || text === 'true' || text === 'yes') return 'enabled'
  if (text === 'disabled' || text === 'false' || text === 'no') return 'disabled'
  return String(value).trim()
}

function assignmentBody(item) {
  const locationId = item.locationId
  return {
    locationType: item.locationType || '',
    locationId: locationId && typeof locationId === 'object' ? locationId._id || '' : locationId || '',
    scope: item.scope || '',
    accessRole: item.accessRole || '',
    status: item.status || 'active',
  }
}

export function formFromEmployee(employee) {
  return {
    name: employee.name || '',
    code: employee.code || '',
    email: employee.email || '',
    phone: employee.phone || '',
    department: employee.department || '',
    jobTitle: employee.jobTitle || '',
    employmentType: employee.employmentType || 'full_time',
    joiningDate: dateInput(employee.joiningDate),
    reportsTo: employee.reportsTo || '',
    status: employee.status || 'active',
    branchId: idOf(employee.branchId),
    shopAssignment: employee.shopAssignment || '',
    warehouseAccess: employee.warehouseAccess || '',
    erpRole: employee.erpRole || 'branch_manager',
    createLogin: normalizeCreateLogin(employee.createLogin),
    notes: employee.notes || '',
  }
}

export function toEmployeeBody(form, existingAssignments = []) {
  const branchId = String(form.branchId || '').trim()
  const preserved = existingAssignments
    .filter((item) => !(item.locationType === 'branch' && (item.scope === 'primary' || !item.scope)))
    .map(assignmentBody)

  const assignments = branchId
    ? [
        {
          locationType: 'branch',
          locationId: branchId,
          scope: 'primary',
          accessRole: form.erpRole || 'branch_manager',
          status: form.status === 'inactive' ? 'inactive' : 'active',
        },
        ...preserved,
      ]
    : preserved

  return {
    name: form.name.trim(),
    code: form.code.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    department: form.department.trim(),
    jobTitle: form.jobTitle.trim(),
    employmentType: form.employmentType || 'full_time',
    joiningDate: form.joiningDate || null,
    reportsTo: form.reportsTo.trim(),
    branchId,
    shopAssignment: form.shopAssignment.trim(),
    warehouseAccess: form.warehouseAccess.trim(),
    erpRole: form.erpRole || 'branch_manager',
    createLogin: form.createLogin.trim(),
    userId: null,
    status: form.status || 'active',
    notes: form.notes.trim(),
    assignments,
  }
}
