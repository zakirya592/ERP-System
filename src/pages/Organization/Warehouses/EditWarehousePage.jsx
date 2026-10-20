import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useBranches } from '../../../queries/branches/branches.queries.js'
import { useEmployees } from '../../../queries/employees/employees.queries.js'
import { useUpdateWarehouse, useWarehouse } from '../../../queries/warehouses/warehouses.queries.js'
import {
  applyApiErrors,
  binTrackingOptions,
  branchNameOf,
  formFromWarehouse,
  managerNameOf,
  negativeStockOptions,
  statusClassName,
  toWarehouseBody,
  warehouseAccess,
  warehouseRule,
  warehouseStatuses,
  warehouseTypes,
  withOption,
} from './warehouseRecords.js'

function EditWarehousePage() {
  const { id } = useParams()
  const warehouseQuery = useWarehouse(id)
  const warehouse = warehouseQuery.data?.data

  if (warehouseQuery.isLoading) {
    return <Message>Loading warehouse...</Message>
  }

  if (warehouseQuery.isError) {
    return <Message className="text-rose-500">{warehouseQuery.error.response?.data?.message || 'Could not load this warehouse.'}</Message>
  }

  if (!warehouse) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Warehouse not found</h1>
        <Link to="/organization/warehouses" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Warehouses
        </Link>
      </section>
    )
  }

  return <EditWarehouseForm key={warehouse._id} warehouse={warehouse} />
}

function EditWarehouseForm({ warehouse }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const updateWarehouse = useUpdateWarehouse()
  const branchesQuery = useBranches({ page: 1, limit: 50, search: '', status: 'active' })
  const employeesQuery = useEmployees({ page: 1, limit: 100, search: '', status: '' })
  const [form, setForm] = useState(() => formFromWarehouse(warehouse))
  const [errors, setErrors] = useState({})

  const branchOptions = withOption(
    (branchesQuery.data?.data || []).map((branch) => ({
      value: branch._id,
      label: branch.name,
    })),
    form.branchId,
    branchNameOf(warehouse),
  )
  const managerOptions = withOption(
    (employeesQuery.data?.data || []).map((employee) => ({
      value: employee._id,
      label: employee.name || employee.code,
    })),
    form.managerId,
    managerNameOf(warehouse),
  )

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

  function save(event) {
    event.preventDefault()
    if (!validate() || updateWarehouse.isPending) return
    updateWarehouse.mutate(
      { id, ...toWarehouseBody(form) },
      {
        onSuccess: (data) => {
          toast.success(data?.message || `${form.name.trim()} updated.`)
          navigate(`/organization/warehouses/${id}`)
        },
        onError: (error) => {
          applyApiErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not update the warehouse.')
        },
      },
    )
  }

  const statusLabel = warehouseStatuses.find((option) => option.value === form.status)?.label || form.status || 'Active'

  return (
    <form className="space-y-4" onSubmit={save}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <span>Organization</span>
            <span>/</span>
            <Link to="/organization/warehouses" className="hover:text-slate-700">
              Warehouses
            </Link>
            <span>/</span>
            <span className="text-slate-700">Edit</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Edit Warehouse</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage storage locations, custodians, zones and stock access.
          </p>
        </div>
        <Link to="/organization/warehouses" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700">
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
              options={withOption(warehouseTypes, form.warehouseType, warehouse.warehouseTypeLabel)}
              onChange={(value) => update('warehouseType', value)}
            />
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
              options={withOption(binTrackingOptions, form.binTracking)}
              onChange={(value) => update('binTracking', value)}
            />
            <SelectField
              label="Negative stock"
              value={form.negativeStock}
              error={errors.negativeStock}
              placeholder="Select negative stock"
              options={withOption(negativeStockOptions, form.negativeStock)}
              onChange={(value) => update('negativeStock', value)}
            />
            <SelectField
              label="Status"
              value={form.status}
              error={errors.status}
              placeholder="Select status"
              options={withOption(warehouseStatuses, form.status)}
              onChange={(value) => update('status', value)}
            />
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
              disabled={updateWarehouse.isPending}
              className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateWarehouse.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Required fields. {warehouseRule}
          </p>
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-4">
          <h2 className="text-[18px] font-semibold text-slate-900">{form.name || warehouse.name}</h2>
          <p className="mt-1 text-[13px] text-slate-400">{form.code || warehouse.code}</p>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(statusLabel)}`}>
              {statusLabel}
            </span>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{warehouse.notes || warehouseRule}</p>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Branch" value={branchNameOf(warehouse) || '—'} />
            <SideFact label="Created on" value={formatSideDate(warehouse.createdAt)} />
            <SideFact label="Updated" value={formatSideDate(warehouse.updatedAt)} />
            <SideFact label="Record status" value={statusLabel} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{warehouseAccess}</p>
          </div>
          <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3.5">
            <p className="text-[13px] font-semibold text-slate-700">History is retained</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">
              Changes apply to this record. Existing documents retain their original references.
            </p>
          </div>
        </aside>
      </div>
    </form>
  )
}

function formatSideDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

function Message({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center text-sm font-semibold shadow-sm ${className}`}>
      {children}
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

function SideFact({ label, value }) {
  return (
    <div>
      <dt className="text-[13px] text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-[14px] font-medium text-slate-800">{value}</dd>
    </div>
  )
}

export default EditWarehousePage
