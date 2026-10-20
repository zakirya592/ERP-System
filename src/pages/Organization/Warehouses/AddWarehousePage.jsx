import { useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useBranches } from '../../../queries/branches/branches.queries.js'
import { useEmployees } from '../../../queries/employees/employees.queries.js'
import { useCreateWarehouse } from '../../../queries/warehouses/warehouses.queries.js'
import {
  applyApiErrors,
  binTrackingOptions,
  negativeStockOptions,
  toWarehouseBody,
  warehouseAccess,
  warehouseRule,
  warehouseStatuses,
  warehouseTypes,
} from './warehouseRecords.js'

const steps = [
  'Complete required information',
  'Assign branch and responsible staff',
  'Review access and status',
  'Save the record',
]

const emptyForm = {
  name: '',
  code: '',
  branchId: '',
  warehouseType: 'finished_goods',
  location: '',
  address: '',
  phone: '',
  floorArea: '',
  storageCapacity: '',
  managerId: '',
  stockAccount: '',
  defaultZone: '',
  binTracking: '',
  negativeStock: '',
  status: 'active',
  notes: '',
}

function AddWarehousePage() {
  const navigate = useNavigate()
  const createWarehouse = useCreateWarehouse()
  const branchesQuery = useBranches({ page: 1, limit: 50, search: '', status: 'active' })
  const employeesQuery = useEmployees({ page: 1, limit: 100, search: '', status: 'active' })
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const branchOptions = (branchesQuery.data?.data || []).map((branch) => ({
    value: branch._id,
    label: branch.name,
  }))
  const managerOptions = (employeesQuery.data?.data || []).map((employee) => ({
    value: employee._id,
    label: employee.name || employee.code,
  }))

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Enter a warehouse name.'
    if (!form.code.trim()) nextErrors.code = 'Enter a warehouse code.'
    if (!form.branchId) nextErrors.branchId = 'Select a parent branch.'
    if (!form.address.trim()) nextErrors.address = 'Enter an address.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function save(andAnother) {
    if (!validate() || createWarehouse.isPending) return
    createWarehouse.mutate(toWarehouseBody(form), {
      onSuccess: (data) => {
        toast.success(data?.message || `${form.name.trim()} saved.`)
        if (andAnother) {
          setForm(emptyForm)
          setErrors({})
          return
        }
        const id = data?.data?._id
        navigate('/organization/warehouses', { state: id ? { selectedId: id } : undefined })
      },
      onError: (error) => {
        applyApiErrors(error, setErrors)
        toast.error(error.response?.data?.message || 'Could not save the warehouse.')
      },
    })
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
            <Link to="/dashboard" className="hover:text-slate-700">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/organization/warehouses" className="hover:text-slate-700">
              Warehouses
            </Link>
            <span>/</span>
            <span className="text-slate-700">Add</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Add Warehouse</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Create a storage location, assign its branch, and prepare stock access.
          </p>
        </div>
        <Link to="/organization/warehouses" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2f6fed]">
          <ArrowLeft size={15} />
          Back to Warehouses
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <FormCard title="Warehouse information">
            <Field label="Warehouse name" required value={form.name} error={errors.name} placeholder="Enter warehouse name" onChange={(value) => update('name', value)} />
            <Field label="Warehouse code" required value={form.code} error={errors.code} placeholder="Enter warehouse code" onChange={(value) => update('code', value)} />
            <SelectField
              label="Parent branch"
              required
              value={form.branchId}
              error={errors.branchId}
              placeholder="Select parent branch"
              options={branchOptions}
              onChange={(value) => update('branchId', value)}
            />
            <SelectField
              label="Warehouse type"
              value={form.warehouseType}
              error={errors.warehouseType}
              placeholder="Select warehouse type"
              options={warehouseTypes}
              onChange={(value) => update('warehouseType', value)}
            />
            {branchesQuery.isError && (
              <p className="text-[13px] text-rose-500 md:col-span-2">Could not load branches.</p>
            )}
          </FormCard>

          <FormCard title="Location and capacity">
            <Field label="Address" required value={form.address} error={errors.address} placeholder="Enter address" onChange={(value) => update('address', value)} />
            <Field label="Location" value={form.location} error={errors.location} placeholder="Enter location" onChange={(value) => update('location', value)} />
            <Field label="Contact phone" value={form.phone} error={errors.phone} placeholder="Enter contact phone" onChange={(value) => update('phone', value)} />
            <Field label="Floor area" value={form.floorArea} error={errors.floorArea} placeholder="Enter floor area" onChange={(value) => update('floorArea', value)} />
            <Field label="Storage capacity" value={form.storageCapacity} error={errors.storageCapacity} placeholder="Enter storage capacity" onChange={(value) => update('storageCapacity', value)} />
          </FormCard>

          <FormCard title="Stock controls and access">
            <SelectField
              label="Custodian"
              value={form.managerId}
              error={errors.managerId}
              placeholder="Select custodian"
              options={managerOptions}
              onChange={(value) => update('managerId', value)}
            />
            <Field label="Default stock account" value={form.stockAccount} error={errors.stockAccount} placeholder="Enter default stock account" onChange={(value) => update('stockAccount', value)} />
            <Field label="Default zone" value={form.defaultZone} error={errors.defaultZone} placeholder="Enter default zone" onChange={(value) => update('defaultZone', value)} />
            <SelectField
              label="Bin tracking"
              value={form.binTracking}
              error={errors.binTracking}
              placeholder="Select bin tracking"
              options={binTrackingOptions}
              onChange={(value) => update('binTracking', value)}
            />
            <SelectField
              label="Negative stock"
              value={form.negativeStock}
              error={errors.negativeStock}
              placeholder="Select negative stock"
              options={negativeStockOptions}
              onChange={(value) => update('negativeStock', value)}
            />
            <SelectField
              label="Status"
              value={form.status}
              error={errors.status}
              placeholder="Select status"
              options={warehouseStatuses}
              onChange={(value) => update('status', value)}
            />
            {employeesQuery.isError && (
              <p className="text-[13px] text-rose-500 md:col-span-2">Could not load custodians.</p>
            )}
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
              onClick={() => navigate('/organization/warehouses')}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createWarehouse.isPending}
              className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createWarehouse.isPending ? 'Saving...' : 'Save Warehouse'}
            </button>
            <button
              type="button"
              disabled={createWarehouse.isPending}
              onClick={() => save(true)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save and add another
            </button>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Required fields. {warehouseRule}
          </p>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Before you save</h2>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[12px] font-medium text-[#1f9d57]">
                Draft
              </span>
              <p className="text-sm font-medium text-slate-800">Create a record in this workspace</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-slate-500">{warehouseRule}</p>
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
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{warehouseAccess}</p>
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

function Field({ label, required = false, value, error, placeholder, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
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
          {options.map((option) => {
            const optionValue = typeof option === 'string' ? option : option.value
            const optionLabel = typeof option === 'string' ? option : option.label || option.value
            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            )
          })}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
      </span>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

export default AddWarehousePage
