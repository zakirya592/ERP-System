import { useRef, useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  addEmployeeRecord,
  buildAssignments,
  createLoginOptions,
  employeeAccess,
  employeeBranches,
  employeeSummary,
  employmentStatuses,
  employmentTypes,
  erpRoles,
  loginStatuses,
  nextEmployeeCode,
  employeeCodeTaken,
  optionsForBranch,
  shopsByBranch,
  warehousesByBranch,
} from './employeeRecords.js'

const steps = [
  'Complete required information',
  'Assign branch and responsible staff',
  'Review access and status',
  'Save the record',
]

const emptyForm = {
  name: '',
  code: '',
  email: '',
  phone: '',
  department: '',
  jobTitle: '',
  employmentType: '',
  joiningDate: '',
  reportsTo: '',
  status: '',
  branch: '',
  shop: '',
  warehouse: '',
  erpRole: '',
  createLogin: '',
  loginStatus: '',
  documentType: '',
  documentReference: '',
  fileName: '',
  notes: '',
}

function currentUserName() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user?.name || 'Amina Rahman'
  } catch {
    return 'Amina Rahman'
  }
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

function toEmployee(form) {
  const code = form.code.trim() || nextEmployeeCode()
  const status = form.status || 'Active'
  const today = formatToday()
  return {
    id: code,
    code,
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    department: form.department.trim(),
    jobTitle: form.jobTitle.trim(),
    employmentType: form.employmentType.trim(),
    joiningDate: form.joiningDate.trim(),
    reportsTo: form.reportsTo.trim(),
    status,
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
    createdBy: currentUserName(),
    createdOn: today,
    updatedOn: today,
    summary: employeeSummary,
    access: employeeAccess,
    assignments: buildAssignments(form, code),
  }
}

function AddEmployeePage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const shopOptions = optionsForBranch(shopsByBranch, form.branch)
  const warehouseOptions = optionsForBranch(warehousesByBranch, form.branch)

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
    if (!file) {
      update('fileName', '')
      return
    }
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
    if (!form.email.trim()) nextErrors.email = 'Enter a work email.'
    else if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
    if (!form.department.trim()) nextErrors.department = 'Enter a department.'
    if (!form.jobTitle.trim()) nextErrors.jobTitle = 'Enter a job title.'
    if (!form.branch) nextErrors.branch = 'Select a primary branch.'
    if (form.code.trim() && employeeCodeTaken(form.code)) nextErrors.code = 'This employee code is already in use.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function save(andAnother) {
    if (!validate()) return
    const employee = addEmployeeRecord(toEmployee(form))
    toast.success(`${employee.name} saved.`)
    if (andAnother) {
      setForm(emptyForm)
      setErrors({})
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    navigate('/organization/employees', { state: { selectedId: employee.id } })
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        save(false)
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <span>Organization</span>
            <span>/</span>
            <Link to="/organization/employees" className="hover:text-slate-700">
              Employees
            </Link>
            <span>/</span>
            <span className="text-slate-700">Add</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Add Employee</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage employee profiles, reporting lines, workplace assignments and ERP access.
          </p>
        </div>
        <Link to="/organization/employees" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2f6fed]">
          <ArrowLeft size={15} />
          Back to Employees
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <FormCard title="Personal and contact information">
            <Field label="Full name" required value={form.name} error={errors.name} placeholder="Enter full name" onChange={(value) => update('name', value)} />
            <Field label="Employee code" value={form.code} error={errors.code} placeholder="Enter employee code" onChange={(value) => update('code', value)} />
            <Field label="Work email" required type="email" value={form.email} error={errors.email} placeholder="Enter work email" onChange={(value) => update('email', value)} />
            <Field label="Phone" value={form.phone} placeholder="Enter phone" onChange={(value) => update('phone', value)} />
          </FormCard>

          <FormCard title="Employment and reporting">
            <Field label="Department" required value={form.department} error={errors.department} placeholder="Enter department" onChange={(value) => update('department', value)} />
            <Field label="Job title" required value={form.jobTitle} error={errors.jobTitle} placeholder="Enter job title" onChange={(value) => update('jobTitle', value)} />
            <SelectField label="Employment type" value={form.employmentType} placeholder="Select employment type" options={employmentTypes} onChange={(value) => update('employmentType', value)} />
            <Field label="Joining date" value={form.joiningDate} placeholder="Select joining date" onChange={(value) => update('joiningDate', value)} />
            <Field label="Reports to" value={form.reportsTo} placeholder="Enter reports to" onChange={(value) => update('reportsTo', value)} />
            <SelectField label="Employment status" value={form.status} placeholder="Select employment status" options={employmentStatuses} onChange={(value) => update('status', value)} />
          </FormCard>

          <FormCard title="Workspace assignment and access">
            <SelectField label="Primary branch" required value={form.branch} error={errors.branch} placeholder="Select primary branch" options={employeeBranches} onChange={(value) => update('branch', value)} />
            <SelectField label="Shop assignment" value={form.shop} placeholder="Select shop assignment" options={shopOptions} onChange={(value) => update('shop', value)} />
            <SelectField label="Warehouse access" value={form.warehouse} placeholder="Enter warehouse access" options={warehouseOptions} onChange={(value) => update('warehouse', value)} />
            <SelectField label="ERP role" value={form.erpRole} placeholder="Select ERP role" options={erpRoles} onChange={(value) => update('erpRole', value)} />
            <SelectField label="Create login" value={form.createLogin} placeholder="Select create login" options={createLoginOptions} onChange={(value) => update('createLogin', value)} />
            <SelectField label="Login status" value={form.loginStatus} placeholder="Enter login status" options={loginStatuses} onChange={(value) => update('loginStatus', value)} />
            <p className="text-[13px] leading-5 text-slate-400 md:col-span-2">
              An employee record can be saved without ERP login. Restrict login creation only when access is required.
            </p>
          </FormCard>

          <FormCard title="Documents and notes">
            <Field label="Document type" value={form.documentType} placeholder="Employment contract / ID" onChange={(value) => update('documentType', value)} />
            <Field label="Document reference" value={form.documentReference} placeholder="Enter document reference" onChange={(value) => update('documentReference', value)} />
            <div className="md:col-span-2">
              <span className="text-sm text-slate-700">Upload document</span>
              <p className="mt-1 text-[13px] text-slate-400">
                PDF, JPG or PNG ·{' '}
                <button type="button" onClick={() => fileRef.current?.click()} className="font-medium text-[#2f6fed]">
                  Choose a file
                </button>{' '}
                to attach supporting evidence.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(event) => onFile(event.target.files?.[0])}
              />
              {form.fileName && <p className="mt-1 text-sm text-slate-700">{form.fileName}</p>}
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
              Save Employee
            </button>
            <button
              type="button"
              onClick={() => save(true)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Save and add another
            </button>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Required fields. {employeeSummary}
          </p>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Before you save</h2>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[12px] font-medium text-[#1f9d57]">Draft</span>
              <p className="text-sm font-medium text-slate-800">Create a record in this workspace</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-slate-500">{employeeSummary}</p>
            <ol className="mt-4 space-y-2.5">
              {steps.map((step, index) => (
                <li key={step} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-medium text-slate-500">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl bg-[#eef4ff] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#2f6fed]">Access and relationships</h2>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{employeeAccess}</p>
          </section>
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

export default AddEmployeePage
