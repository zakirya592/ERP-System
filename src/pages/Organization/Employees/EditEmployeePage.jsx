import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useBranches } from '../../../queries/branches/branches.queries.js'
import { useEmployee, useUpdateEmployee } from '../../../queries/employees/employees.queries.js'
import {
  apiFields,
  branchNameOf,
  createLoginOptions,
  employeeSummary,
  employmentStatuses,
  employmentTypes,
  erpRoles,
  formFromEmployee,
  formatDate,
  statusClassName,
  toEmployeeBody,
  withOption,
} from './employeeRecords.js'

function EditEmployeePage() {
  const { id } = useParams()
  const employeeQuery = useEmployee(id)
  const employee = employeeQuery.data?.data

  if (employeeQuery.isLoading) {
    return <Message>Loading employee...</Message>
  }

  if (employeeQuery.isError) {
    return (
      <Message className="text-rose-500">
        {employeeQuery.error.response?.data?.message || 'Could not load this employee.'}
      </Message>
    )
  }

  if (!employee) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Employee not found</h1>
        <Link to="/organization/employees" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Employees
        </Link>
      </section>
    )
  }

  return <EditEmployeeForm key={employee._id} employee={employee} />
}

function EditEmployeeForm({ employee }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const updateEmployee = useUpdateEmployee()
  const branchesQuery = useBranches({ page: 1, limit: 100, search: '', status: '' })
  const [form, setForm] = useState(() => formFromEmployee(employee))
  const [errors, setErrors] = useState({})
  const branchOptions = withOption(
    (branchesQuery.data?.data || []).map((branch) => ({
      value: branch._id,
      label: branch.name,
    })),
    form.branchId,
    branchNameOf(employee),
  )

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Enter a full name.'
    if (!form.code.trim()) nextErrors.code = 'Enter an employee code.'
    if (!form.email.trim()) nextErrors.email = 'Enter a work email.'
    else if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
    if (!form.department.trim()) nextErrors.department = 'Enter a department.'
    if (!form.jobTitle.trim()) nextErrors.jobTitle = 'Enter a job title.'
    if (!form.branchId) nextErrors.branchId = 'Select a primary branch.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function applyApiErrors(error) {
    const apiErrors = error.response?.data?.errors
    if (!Array.isArray(apiErrors)) return
    const fieldErrors = {}
    apiErrors.forEach((item) => {
      const key = apiFields[item.field] || item.field
      if (key && !fieldErrors[key]) fieldErrors[key] = item.message
    })
    setErrors((current) => ({ ...current, ...fieldErrors }))
  }

  function save(event) {
    event.preventDefault()
    if (!validate()) return
    updateEmployee.mutate(
      { id, ...toEmployeeBody(form, employee.assignments || []) },
      {
        onSuccess: (data) => {
          toast.success(data?.message || `${form.name.trim()} updated.`)
          navigate(`/organization/employees`)
        },
        onError: (error) => {
          applyApiErrors(error)
          toast.error(error.response?.data?.message || 'Could not update the employee.')
        },
      },
    )
  }

  const statusLabel = employmentStatuses.find((option) => option.value === form.status)?.label || form.status || 'Active'

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
            <Field label="Phone" value={form.phone} error={errors.phone} placeholder="Enter contact phone" onChange={(value) => update('phone', value)} />
          </FormCard>

          <FormCard title="Employment and reporting">
            <Field label="Department" required value={form.department} error={errors.department} placeholder="Enter department" onChange={(value) => update('department', value)} />
            <Field label="Job title" required value={form.jobTitle} error={errors.jobTitle} placeholder="Enter job title" onChange={(value) => update('jobTitle', value)} />
            <SelectField label="Employment type" value={form.employmentType} error={errors.employmentType} options={withOption(employmentTypes, form.employmentType)} onChange={(value) => update('employmentType', value)} />
            <Field label="Joining date" type="date" value={form.joiningDate} error={errors.joiningDate} onChange={(value) => update('joiningDate', value)} />
            <Field label="Reports to" value={form.reportsTo} error={errors.reportsTo} placeholder="Enter reports to" onChange={(value) => update('reportsTo', value)} />
            <SelectField label="Employment status" value={form.status} error={errors.status} options={withOption(employmentStatuses, form.status, employee.statusLabel)} onChange={(value) => update('status', value)} />
          </FormCard>

          <FormCard title="Workspace assignment and access">
            <SelectField label="Primary branch" required value={form.branchId} error={errors.branchId} placeholder="Select primary branch" options={branchOptions} onChange={(value) => update('branchId', value)} />
            <Field label="Shop assignment" value={form.shopAssignment} error={errors.shopAssignment} placeholder="Enter shop assignment" onChange={(value) => update('shopAssignment', value)} />
            <Field label="Warehouse access" value={form.warehouseAccess} error={errors.warehouseAccess} placeholder="Enter warehouse access" onChange={(value) => update('warehouseAccess', value)} />
            <SelectField label="ERP role" value={form.erpRole} error={errors.erpRole} options={withOption(erpRoles, form.erpRole, employee.erpRoleLabel)} onChange={(value) => update('erpRole', value)} />
            <SelectField label="Create login" value={form.createLogin} error={errors.createLogin} placeholder="Select create login" options={withOption(createLoginOptions, form.createLogin)} onChange={(value) => update('createLogin', value)} />
            <p className="text-[13px] leading-5 text-slate-400 md:col-span-2">
              An employee record can be saved without ERP login. Restrict login creation only when access is required.
            </p>
          </FormCard>

          <FormCard title="Notes">
            <label className="block md:col-span-2">
              <span className="text-sm text-slate-700">Internal notes</span>
              <textarea
                value={form.notes}
                rows={3}
                placeholder="Add remarks for authorized workspace administrators"
                onChange={(event) => update('notes', event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400"
              />
              {errors.notes && <p className="mt-1 text-xs text-rose-500">{errors.notes}</p>}
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
            <button
              type="submit"
              disabled={updateEmployee.isPending}
              className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateEmployee.isPending ? 'Saving...' : 'Save changes'}
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
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(statusLabel)}`}>
              {statusLabel}
            </span>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{employeeSummary}</p>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Created on" value={formatDate(employee.createdAt)} />
            <SideFact label="Updated" value={formatDate(employee.updatedAt)} />
            <SideFact label="Record status" value={statusLabel} />
            <SideFact label="Login status" value={employee.loginStatusLabel || '—'} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Policy to follow</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">
              Identity details in this screen stay with the employee record.
            </p>
          </div>
        </aside>
      </div>
    </form>
  )
}

function Message({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm ${className}`}>
      <h1 className="text-sm font-semibold">{children}</h1>
    </section>
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
            <option key={option.value} value={option.value}>
              {option.label}
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
