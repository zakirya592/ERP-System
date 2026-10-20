import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  buildAssignments,
  createLoginOptions,
  employeeBranches,
  employeeCodeTaken,
  employeeSummary,
  employmentStatuses,
  employmentTypes,
  erpRoles,
  loginStatuses,
  mergeEmployeeRegister,
  optionsForBranch,
  shopsByBranch,
  updateEmployeeRecord,
  useAddedEmployees,
  useEmployeeOverrides,
  warehousesByBranch,
} from './employeeRecords.js'
import { employees as seedEmployees } from './EmployeePage.jsx'

const statusClass = {
  Active: 'bg-[#e7f8ee] text-[#1f9d57]',
  'On leave': 'bg-[#eef1f4] text-[#6b7280]',
  Inactive: 'bg-[#eef1f4] text-[#8b95a5]',
}

function withCurrent(options, current) {
  const value = String(current || '').trim()
  if (!value || options.includes(value)) return options
  return [value, ...options]
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

function fileKind(name) {
  const extension = String(name).split('.').pop()?.toUpperCase()
  if (!extension || extension === String(name).toUpperCase()) return 'FILE'
  if (extension === 'JPEG') return 'JPG'
  return extension
}

function formFromEmployee(employee) {
  return {
    name: employee.name || '',
    code: employee.code || '',
    email: employee.email || '',
    phone: employee.phone || '',
    department: employee.department || '',
    jobTitle: employee.jobTitle || '',
    employmentType: employee.employmentType || '',
    joiningDate: employee.joiningDate || '',
    reportsTo: employee.reportsTo || '',
    status: employee.status || 'Active',
    branch: employee.branch || '',
    shop: employee.shop || '',
    warehouse: employee.warehouse || '',
    erpRole: employee.erpRole || '',
    createLogin: employee.createLogin || '',
    loginStatus: employee.loginStatus || '',
    documentType: employee.documentType || '',
    documentReference: employee.documentReference || '',
    fileName: employee.fileName || '',
    notes: employee.notes || '',
  }
}

function toUpdatedEmployee(employee, form) {
  const code = form.code.trim()
  return {
    ...employee,
    code,
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    department: form.department.trim(),
    jobTitle: form.jobTitle.trim(),
    employmentType: form.employmentType.trim(),
    joiningDate: form.joiningDate.trim(),
    reportsTo: form.reportsTo.trim(),
    status: form.status || 'Active',
    branch: form.branch,
    shop: form.shop,
    warehouse: form.warehouse,
    erpRole: form.erpRole,
    createLogin: form.createLogin,
    loginStatus: form.loginStatus,
    documentType: form.documentType.trim(),
    documentReference: form.documentReference.trim(),
    fileName: form.fileName.trim(),
    notes: form.notes.trim(),
    updatedOn: formatToday(),
    assignments: buildAssignments(form, employee.id, employee.assignments || []),
  }
}

function EditEmployeePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const addedEmployees = useAddedEmployees()
  const overrides = useEmployeeOverrides()
  const employee =
    mergeEmployeeRegister(addedEmployees, seedEmployees, overrides).find((item) => item.id === id || item.code === id) || null
  const [form, setForm] = useState(() => (employee ? formFromEmployee(employee) : null))
  const [errors, setErrors] = useState({})

  if (!employee || !form) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Employee not found</h1>
        <Link to="/organization/employees" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Employees
        </Link>
      </section>
    )
  }

  const shopOptions = withCurrent(optionsForBranch(shopsByBranch, form.branch), form.shop)
  const warehouseOptions = withCurrent(optionsForBranch(warehousesByBranch, form.branch), form.warehouse)

  function update(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'branch') {
        const shops = optionsForBranch(shopsByBranch, value)
        const warehouses = optionsForBranch(warehousesByBranch, value)
        if (current.shop && !shops.includes(current.shop)) next.shop = ''
        if (current.warehouse && !warehouses.includes(current.warehouse)) next.warehouse = ''
      }
      return next
    })
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function onFile(file) {
    if (!file) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (file.type && !allowed.includes(file.type)) {
      setErrors((current) => ({ ...current, fileName: 'Use a PDF, JPG, or PNG file.' }))
      return
    }
    update('fileName', file.name)
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Enter a full name.'
    if (!form.code.trim()) nextErrors.code = 'Enter an employee code.'
    if (!form.email.trim()) nextErrors.email = 'Enter a work email.'
    else if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
    if (!form.department.trim()) nextErrors.department = 'Enter a department.'
    if (!form.jobTitle.trim()) nextErrors.jobTitle = 'Enter a job title.'
    if (!form.branch) nextErrors.branch = 'Select a primary branch.'
    if (form.code.trim() && employeeCodeTaken(form.code, employee.code)) nextErrors.code = 'This employee code is already in use.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function save(event) {
    event.preventDefault()
    if (!validate()) return
    const updated = updateEmployeeRecord(toUpdatedEmployee(employee, form))
    toast.success(`${updated.name} updated.`)
    navigate(`/organization/employees/${updated.id}`)
  }

  return (
    <form className="space-y-4" onSubmit={save}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <span>Organization</span>
            <span>/</span>
            <Link to="/organization/employees" className="hover:text-slate-700">
              Employees
            </Link>
            <span>/</span>
            <span className="text-slate-700">Edit</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Edit Employee</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage employee profiles, reporting lines, workplace assignments and ERP access.
          </p>
        </div>
        <Link
          to="/organization/employees"
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
        >
          Back to Employees
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <FormCard title="Personal and contact information">
            <Field label="Full name" required value={form.name} error={errors.name} placeholder="Enter full name" onChange={(value) => update('name', value)} />
            <Field label="Employee code" value={form.code} error={errors.code} placeholder="Enter employee code" onChange={(value) => update('code', value)} />
            <Field label="Work email" required type="email" value={form.email} error={errors.email} placeholder="Enter work email" onChange={(value) => update('email', value)} />
            <Field label="Phone" value={form.phone} placeholder="Enter contact phone" onChange={(value) => update('phone', value)} />
          </FormCard>

          <FormCard title="Employment and reporting">
            <Field label="Department" required value={form.department} error={errors.department} placeholder="Enter department" onChange={(value) => update('department', value)} />
            <Field label="Job title" required value={form.jobTitle} error={errors.jobTitle} placeholder="Enter job title" onChange={(value) => update('jobTitle', value)} />
            <SelectField label="Employment type" value={form.employmentType} placeholder="Select employment type" options={withCurrent(employmentTypes, form.employmentType)} onChange={(value) => update('employmentType', value)} />
            <Field label="Joining date" value={form.joiningDate} placeholder="Select joining date" onChange={(value) => update('joiningDate', value)} />
            <Field label="Reports to" value={form.reportsTo} placeholder="Enter reports to" onChange={(value) => update('reportsTo', value)} />
            <SelectField label="Employment status" value={form.status} placeholder="Select employment status" options={employmentStatuses} onChange={(value) => update('status', value)} />
          </FormCard>

          <FormCard title="Workspace assignment and access">
            <SelectField label="Primary branch" required value={form.branch} error={errors.branch} placeholder="Select primary branch" options={withCurrent(employeeBranches, form.branch)} onChange={(value) => update('branch', value)} />
            <SelectField label="Shop assignment" value={form.shop} placeholder="Select shop assignment" options={shopOptions} onChange={(value) => update('shop', value)} />
            <SelectField label="Warehouse access" value={form.warehouse} placeholder="Enter warehouse access" options={warehouseOptions} onChange={(value) => update('warehouse', value)} />
            <SelectField label="ERP role" value={form.erpRole} placeholder="Select ERP role" options={withCurrent(erpRoles, form.erpRole)} onChange={(value) => update('erpRole', value)} />
            <SelectField label="Create login" value={form.createLogin} placeholder="Select create login" options={withCurrent(createLoginOptions, form.createLogin)} onChange={(value) => update('createLogin', value)} />
            <SelectField label="Login status" value={form.loginStatus} placeholder="Enter login status" options={withCurrent(loginStatuses, form.loginStatus)} onChange={(value) => update('loginStatus', value)} />
            <p className="text-[13px] leading-5 text-slate-400 md:col-span-2">
              An employee record can be saved without ERP login. Restrict login creation only when access is required.
            </p>
          </FormCard>

          <FormCard title="Documents and notes">
            <Field label="Document type" value={form.documentType} placeholder="Employment contract / ID" onChange={(value) => update('documentType', value)} />
            <Field label="Document reference" value={form.documentReference} placeholder="Enter document reference" onChange={(value) => update('documentReference', value)} />
            <div className="md:col-span-2">
              <span className="text-sm text-slate-700">Upload document</span>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(event) => onFile(event.target.files?.[0])}
              />
              <p className="mt-1 text-[13px] text-slate-400">
                {form.fileName ? (
                  <>
                    <span className="text-slate-700">{form.fileName}</span>
                    {` · ${fileKind(form.fileName)} · `}
                  </>
                ) : (
                  'PDF, JPG or PNG · '
                )}
                <button type="button" onClick={() => fileRef.current?.click()} className="font-medium text-[#2f6fed]">
                  Choose a file
                </button>{' '}
                to attach supporting evidence.
              </p>
              {errors.fileName && <p className="mt-1 text-xs text-rose-500">{errors.fileName}</p>}
            </div>
            <label className="block md:col-span-2">
              <span className="text-sm text-slate-700">Internal notes</span>
              <textarea
                value={form.notes}
                rows={3}
                placeholder="Add remarks for authorized workspace administrators"
                onChange={(event) => update('notes', event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400"
              />
            </label>
          </FormCard>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/organization/employees')}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button type="submit" className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white">
              Save changes
            </button>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Required fields. {employeeSummary}
          </p>
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900">{form.name || employee.name}</h2>
          <p className="mt-1 text-[13px] text-slate-400">{form.code || employee.code}</p>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClass[form.status] || 'bg-slate-100 text-slate-500'}`}>
              {form.status || 'Active'}
            </span>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{employee.summary}</p>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Created by" value={employee.createdBy || '—'} />
            <SideFact label="Created on" value={employee.createdOn || '—'} />
            <SideFact label="Updated" value={employee.updatedOn || '—'} />
            <SideFact label="Record status" value={form.status || employee.status} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Policy to follow</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">
              Identity details in this screen. Existing documents remain until replacements are saved.
            </p>
          </div>
        </aside>
      </div>
    </form>
  )
}

function FormCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({ label, required = false, value, error, placeholder, type = 'text', onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 ${
          error ? 'border-rose-300' : 'border-slate-200'
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

function SelectField({ label, required = false, value, error, placeholder, options, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <span className="relative mt-1.5 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-8 text-sm outline-none focus:border-sky-400 ${
            error ? 'border-rose-300' : 'border-slate-200'
          } ${value ? 'text-slate-800' : 'text-slate-400'}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
      </span>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

function SideFact({ label, value }) {
  return (
    <div>
      <dt className="text-[13px] text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-[14px] font-medium text-slate-800">{value}</dd>
    </div>
  )
}

export default EditEmployeePage
