import { useState } from 'react'
import { ArrowLeft, Check, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const tabs = ['Branches', 'Shops', 'Warehouses', 'Employees', 'Owners', 'Partnerships']

const branchTypes = ['Retail', 'Distribution', 'Regional office']
const managers = ['Omar Khalid', 'Nadia Saleh', 'Lina Abbas']
const warehouses = [
  { value: 'WH-001', label: 'Main Warehouse' },
  { value: 'WH-002', label: 'Reserve Warehouse' },
  { value: 'WH-011', label: 'North Warehouse' },
  { value: 'WH-021', label: 'Airport Warehouse' },
]
const shops = [
  { value: 'SH-001', label: 'Central Shop' },
  { value: 'SH-002', label: 'Market Shop' },
  { value: 'SH-003', label: 'Riverside Shop' },
  { value: 'SH-011', label: 'North Shop' },
]
const documentTypes = ['Registration', 'License', 'Lease agreement', 'Tax certificate']

const steps = [
  'Complete required information',
  'Assign branch and responsible staff',
  'Review access and status',
  'Save the record',
]

const emptyForm = {
  name: '',
  code: '',
  type: '',
  openingDate: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  manager: '',
  warehouse: '',
  shop: '',
  currency: '',
  costCenter: '',
  documentPrefix: '',
  documentType: '',
  documentReference: '',
  documentName: '',
  notes: '',
}

function AddBranchPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Enter a branch name.'
    if (!form.address.trim()) nextErrors.address = 'Enter an address.'
    if (!form.manager) nextErrors.manager = 'Select a branch manager.'
    if (!form.warehouse) nextErrors.warehouse = 'Select a default warehouse.'
    if (form.email.trim() && !form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    toast.success(`${form.name.trim()} saved.`)
    navigate('/organization/branches')
  }

  function saveAnother() {
    if (!validate()) return
    toast.success(`${form.name.trim()} saved. Add another branch.`)
    setForm(emptyForm)
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
        <Link
          to="/organization/branches"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2f6fed]"
        >
          <ArrowLeft size={15} />
          Back to Branches
        </Link>
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
              placeholder="Enter branch code"
              onChange={(value) => update('code', value)}
            />
            <SelectField
              label="Branch type"
              value={form.type}
              placeholder="Select branch type"
              options={branchTypes}
              onChange={(value) => update('type', value)}
            />
            <Field
              label="Opening date"
              type="date"
              value={form.openingDate}
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
              placeholder="Enter city / district"
              onChange={(value) => update('city', value)}
            />
            <Field
              label="Phone"
              value={form.phone}
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
              required
              value={form.manager}
              error={errors.manager}
              placeholder="Select branch manager"
              options={managers}
              onChange={(value) => update('manager', value)}
            />
            <SelectField
              label="Default warehouse"
              required
              value={form.warehouse}
              error={errors.warehouse}
              placeholder="Select default warehouse"
              options={warehouses}
              onChange={(value) => update('warehouse', value)}
            />
            <SelectField
              label="Default shop"
              value={form.shop}
              placeholder="Select shop"
              options={shops}
              onChange={(value) => update('shop', value)}
            />
            <Field
              label="Default currency"
              value={form.currency}
              placeholder="Enter default currency"
              onChange={(value) => update('currency', value)}
            />
            <Field
              label="Cost center"
              value={form.costCenter}
              placeholder="Enter cost center"
              onChange={(value) => update('costCenter', value)}
            />
            <Field
              label="Document prefix"
              value={form.documentPrefix}
              placeholder="Enter document prefix"
              onChange={(value) => update('documentPrefix', value)}
            />
          </FormCard>

          <FormCard title="Documents and notes">
            <SelectField
              label="Document type"
              value={form.documentType}
              placeholder="Select type"
              options={documentTypes}
              onChange={(value) => update('documentType', value)}
            />
            <Field
              label="Document reference"
              value={form.documentReference}
              placeholder="Enter document reference"
              onChange={(value) => update('documentReference', value)}
            />
            <label className="block md:col-span-2">
              <span className="text-sm text-slate-700">Registration / license</span>
              <span className="mt-1.5 flex items-center gap-3">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => update('documentName', event.target.files?.[0]?.name || '')}
                  className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border file:border-slate-200 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
                />
              </span>
              <p className="mt-1 text-xs text-slate-400">
                {form.documentName
                  ? form.documentName
                  : 'PDF, JPG or PNG · Choose a file to attach supporting evidence.'}
              </p>
            </label>
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
              onClick={() => navigate('/organization/branches')}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white"
            >
              Save branch
            </button>
            <button
              type="button"
              onClick={saveAnother}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
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
