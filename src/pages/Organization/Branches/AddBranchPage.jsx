import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCreateBranch } from '../../../queries/branches/branches.queries.js'
import { useShops } from '../../../queries/shops/shops.queries.js'
import { useUsers } from '../../../queries/users/users.queries.js'
import { useWarehouses } from '../../../queries/warehouses/warehouses.queries.js'

const branchTypes = [
  { value: 'head_office', label: 'Head office' },
  { value: 'retail', label: 'Retail' },
  { value: 'distribution', label: 'Distribution' },
  { value: 'regional_office', label: 'Regional office' },
]
const apiFields = {
  branchType: 'type',
  location: 'city',
  managerId: 'manager',
  defaultWarehouseId: 'warehouse',
  defaultShopId: 'shop',
  costCentre: 'costCenter',
  openingDate: 'openingDate',
}

const steps = [
  'Complete required information',
  'Assign branch and responsible staff',
  'Review access and status',
  'Save the record',
]

const emptyForm = {
  name: '',
  code: '',
  type: 'head_office',
  address: '',
  city: '',
  phone: '',
  email: '',
  manager: '',
  warehouse: '',
  shop: '',
  costCenter: '',
  documentPrefix: '',
  openingDate: '',
}

function nullableId(value) {
  const text = String(value ?? '').trim()
  return text || null
}

function todayInput() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function recordOptions(records) {
  return (records || []).flatMap((item) => {
    if (!item?._id) return []
    return [{ value: item._id, label: item.name || item.code || item._id }]
  })
}

function toBranchBody(form) {
  return {
    name: form.name.trim(),
    code: form.code.trim(),
    branchType: form.type || 'head_office',
    openingDate: form.openingDate || todayInput(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    location: form.city.trim(),
    address: form.address.trim(),
    managerId: nullableId(form.manager),
    defaultWarehouseId: nullableId(form.warehouse),
    defaultShopId: nullableId(form.shop),
    status: 'active',
    costCentre: form.costCenter.trim(),
    documentPrefix: form.documentPrefix.trim(),
  }
}

function AddBranchPage() {
  const navigate = useNavigate()
  const createBranch = useCreateBranch()
  const usersQuery = useUsers({ page: 1, limit: 100, search: '', status: '' })
  const warehousesQuery = useWarehouses({ page: 1, limit: 100, search: '', status: 'active', branchId: '' })
  const shopsQuery = useShops({ page: 1, limit: 100, search: '', status: 'active', branchId: '' })
  const managers = (usersQuery.data?.data || []).map((user) => ({
    value: user._id,
    label: user.name || user.email,
  }))
  const warehouses = recordOptions(warehousesQuery.data?.data)
  const shops = recordOptions(shopsQuery.data?.data)
  const [form, setForm] = useState(() => ({ ...emptyForm, openingDate: todayInput() }))
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Enter a branch name.'
    if (!form.address.trim()) nextErrors.address = 'Enter an address.'
    if (form.email.trim() && !form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
    if (!form.openingDate) nextErrors.openingDate = 'Enter an opening date.'
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

  function save(andAnother) {
    if (!validate()) return
    createBranch.mutate(toBranchBody(form), {
      onSuccess: (data) => {
        toast.success(data?.message || `${form.name.trim()} saved.`)
        if (andAnother) {
          setForm({ ...emptyForm, openingDate: todayInput() })
          setErrors({})
          return
        }
        navigate('/organization/branches')
      },
      onError: (error) => {
        applyApiErrors(error)
        toast.error(error.response?.data?.message || 'Could not save the branch.')
      },
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    save(false)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link to="/dashboard" className="hover:text-slate-700">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/organization/branches" className="hover:text-slate-700">
              Organization Branches
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Add Branch</span>
          </nav>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Add Branch</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage operating branches, locations, manager and branch access.
          </p>
        </div>
      
      </div>

   

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <FormCard title="Branch information">
            <Field
              label="Branch name"
              required
              value={form.name}
              error={errors.name}
              placeholder="Enter branch name"
              onChange={(value) => update('name', value)}
            />
            <Field
              label="Branch code"
              value={form.code}
              error={errors.code}
              placeholder="Enter branch code"
              onChange={(value) => update('code', value)}
            />
            <SelectField
              label="Branch type"
              value={form.type}
              error={errors.type}
              placeholder="Select branch type"
              options={branchTypes}
              onChange={(value) => update('type', value)}
            />
            <Field
              label="Opening date"
              type="date"
              value={form.openingDate}
              error={errors.openingDate}
              onChange={(value) => update('openingDate', value)}
            />
          </FormCard>

          <FormCard title="Address and contact">
            <Field
              label="Address"
              required
              value={form.address}
              error={errors.address}
              placeholder="Enter address"
              onChange={(value) => update('address', value)}
            />
            <Field
              label="City / district"
              value={form.city}
              error={errors.city}
              placeholder="Enter city / district"
              onChange={(value) => update('city', value)}
            />
            <Field
              label="Phone"
              value={form.phone}
              error={errors.phone}
              placeholder="Enter phone"
              onChange={(value) => update('phone', value)}
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              error={errors.email}
              placeholder="Enter email"
              onChange={(value) => update('email', value)}
            />
          </FormCard>

          <FormCard title="Management and defaults">
            <SelectField
              label="Branch manager"
              value={form.manager}
              error={errors.manager}
              placeholder="Select branch manager"
              options={managers}
              onChange={(value) => update('manager', value)}
            />
            <SelectField
              label="Default warehouse"
              value={form.warehouse}
              error={errors.warehouse}
              placeholder="Select default warehouse"
              options={warehouses}
              onChange={(value) => update('warehouse', value)}
            />
            <SelectField
              label="Default shop"
              value={form.shop}
              error={errors.shop}
              placeholder="Select shop"
              options={shops}
              onChange={(value) => update('shop', value)}
            />
            <Field
              label="Cost center"
              value={form.costCenter}
              error={errors.costCenter}
              placeholder="Enter cost center"
              onChange={(value) => update('costCenter', value)}
            />
            <Field
              label="Document prefix"
              value={form.documentPrefix}
              error={errors.documentPrefix}
              placeholder="Enter document prefix"
              onChange={(value) => update('documentPrefix', value)}
            />
            {(warehousesQuery.isError || shopsQuery.isError) && (
              <p className="text-[13px] text-rose-500 md:col-span-2">
                {warehousesQuery.isError ? 'Could not load warehouses. ' : ''}
                {shopsQuery.isError ? 'Could not load shops.' : ''}
              </p>
            )}
          </FormCard>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/organization/branches')}
              disabled={createBranch.isPending}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBranch.isPending}
              className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createBranch.isPending ? 'Saving' : 'Save branch'}
            </button>
            <button
              type="button"
              onClick={() => save(true)}
              disabled={createBranch.isPending}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save and add another
            </button>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Required fields. Each shop and warehouse belongs to one branch.
            Access is limited to assigned locations.
          </p>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Before you save</h2>
            <div className="mt-3 flex items-start gap-2">
              <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check size={11} />
              </span>
              <p className="text-sm font-medium text-slate-800">Create linked in this workspace</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-slate-500">
              Each shop and warehouse belongs to one branch. Access is limited to assigned locations.
            </p>
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
            <p className="mt-1 text-[13px] leading-5 text-slate-600">
              Branch access permits operational view, approval and posting remain role based.
            </p>
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
          className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-sky-400 ${
            error ? 'border-rose-300' : 'border-slate-200'
          } ${value ? 'text-slate-800' : 'text-slate-400'}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => {
            const optionValue = typeof option === 'string' ? option : option.value
            const optionLabel = typeof option === 'string' ? option : option.label
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

export default AddBranchPage
