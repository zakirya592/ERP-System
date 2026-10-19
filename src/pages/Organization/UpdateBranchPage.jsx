import { useEffect, useState } from 'react'
import { ArrowLeft, Check, ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useBranch, useUpdateBranch, useUpdateBranchStatus } from '../../queries/branches/branches.queries.js'
import { useUsers } from '../../queries/users/users.queries.js'

const branchTypes = [
  { value: 'head_office', label: 'Head office' },
  { value: 'retail', label: 'Retail' },
  { value: 'distribution', label: 'Distribution' },
  { value: 'regional_office', label: 'Regional office' },
]
const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]
const documentTypes = ['Registration', 'License', 'Lease agreement', 'Tax certificate']

const apiFields = {
  branchType: 'type',
  location: 'city',
  managerId: 'manager',
  defaultWarehouseId: 'warehouse',
  defaultShopId: 'shop',
  costCentre: 'costCenter',
  'document.type': 'documentType',
  'document.reference': 'documentReference',
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
  openingDate: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  manager: '',
  warehouse: '',
  shop: '',
  status: 'active',
  costCenter: '',
  documentPrefix: '',
  documentType: '',
  documentReference: '',
  notes: '',
}

function idOf(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id || ''
}

function dateInput(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function nullableId(value) {
  const text = String(value ?? '').trim()
  return text || null
}

function toBranchBody(form) {
  return {
    name: form.name.trim(),
    code: form.code.trim(),
    branchType: form.type || 'head_office',
    openingDate: form.openingDate || null,
    phone: form.phone.trim(),
    email: form.email.trim(),
    location: form.city.trim(),
    address: form.address.trim(),
    managerId: nullableId(form.manager),
    defaultWarehouseId: nullableId(form.warehouse),
    defaultShopId: nullableId(form.shop),
    status: form.status || 'active',
    costCentre: form.costCenter.trim(),
    documentPrefix: form.documentPrefix.trim(),
    document: {
      type: form.documentType.trim(),
      reference: form.documentReference.trim(),
    },
    notes: form.notes.trim(),
  }
}

function UpdateBranchPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const branchQuery = useBranch(id)
  const updateBranch = useUpdateBranch()
  const updateStatus = useUpdateBranchStatus()
  const usersQuery = useUsers({ page: 1, limit: 100, search: '', status: '' })
  const branch = branchQuery.data?.data
  const [form, setForm] = useState(emptyForm)
  const [ready, setReady] = useState(false)
  const [errors, setErrors] = useState({})
  const managers = (usersQuery.data?.data || []).map((user) => ({
    value: user._id,
    label: user.name || user.email,
  }))

  useEffect(() => {
    if (!branch || ready) return
    setForm({
      name: branch.name || '',
      code: branch.code || '',
      type: branch.branchType || 'head_office',
      openingDate: dateInput(branch.openingDate),
      address: branch.address || '',
      city: branch.location || '',
      phone: branch.phone || '',
      email: branch.email || '',
      manager: idOf(branch.manager || branch.managerId),
      warehouse: idOf(branch.defaultWarehouse || branch.defaultWarehouseId),
      shop: idOf(branch.defaultShop || branch.defaultShopId),
      status: branch.status || 'active',
      costCenter: branch.costCentre || '',
      documentPrefix: branch.documentPrefix || '',
      documentType: branch.document?.type || '',
      documentReference: branch.document?.reference || '',
      notes: branch.notes || '',
    })
    setReady(true)
  }, [branch, ready])

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Enter a branch name.'
    if (!form.address.trim()) nextErrors.address = 'Enter an address.'
    if (form.email.trim() && !form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
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

  function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    const body = toBranchBody(form)
    const statusChanged = body.status !== (branch?.status || 'active')

    updateBranch.mutate(
      { id, ...body },
      {
        onSuccess: (data) => {
          if (!statusChanged) {
            toast.success(data?.message || `${form.name.trim()} updated.`)
            navigate('/organization/branches')
            return
          }

          updateStatus.mutate(
            { id, status: body.status },
            {
              onSuccess: (statusData) => {
                toast.success(statusData?.message || data?.message || `${form.name.trim()} updated.`)
                navigate('/organization/branches')
              },
              onError: (error) => {
                applyApiErrors(error)
                toast.error(error.response?.data?.message || 'Could not update the branch status.')
              },
            },
          )
        },
        onError: (error) => {
          applyApiErrors(error)
          toast.error(error.response?.data?.message || 'Could not update the branch.')
        },
      },
    )
  }

  const typeOptions = branchTypes.some((option) => option.value === form.type)
    ? branchTypes
    : [...branchTypes, { value: form.type, label: form.type }]
  const documentOptions = !form.documentType || documentTypes.includes(form.documentType)
    ? documentTypes
    : [form.documentType, ...documentTypes]

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
            <span className="font-medium text-slate-700">Update Branch</span>
          </nav>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Update Branch</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage operating branches, locations, manager and branch access.
          </p>
        </div>
       
      </div>

      {branchQuery.isLoading && (
        <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-10 text-center text-sm text-slate-400 shadow-sm">
          Loading branch...
        </section>
      )}

      {branchQuery.isError && (
        <section className="rounded-2xl border border-rose-100 bg-white px-6 py-8 text-center text-sm text-rose-500 shadow-sm">
          {branchQuery.error.response?.data?.message || 'Could not load this branch.'}
        </section>
      )}

      {ready && (
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
                options={typeOptions}
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
                options={[]}
                onChange={(value) => update('warehouse', value)}
              />
              <SelectField
                label="Default shop"
                value={form.shop}
                error={errors.shop}
                placeholder="Select shop"
                options={[]}
                onChange={(value) => update('shop', value)}
              />
              <SelectField
                label="Status"
                value={form.status}
                error={errors.status}
                options={statuses}
                onChange={(value) => update('status', value)}
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
            </FormCard>

            <FormCard title="Documents and notes">
              <SelectField
                label="Document type"
                value={form.documentType}
                error={errors.documentType}
                placeholder="Select type"
                options={documentOptions}
                onChange={(value) => update('documentType', value)}
              />
              <Field
                label="Document reference"
                value={form.documentReference}
                error={errors.documentReference}
                placeholder="Enter document reference"
                onChange={(value) => update('documentReference', value)}
              />
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
                onClick={() => navigate(`/organization/branches/${id}`)}
                disabled={updateBranch.isPending || updateStatus.isPending}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateBranch.isPending || updateStatus.isPending}
                className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateBranch.isPending || updateStatus.isPending ? 'Saving' : 'Update branch'}
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
                <p className="text-sm font-medium text-slate-800">Update this branch</p>
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
      )}
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

export default UpdateBranchPage
