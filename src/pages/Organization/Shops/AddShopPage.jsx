import { useRef, useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { addShopRecord, nextShopCode, shopCodeTaken } from './shopRecords.js'

const parentBranches = ['Central Branch', 'North Branch', 'Airport Branch']

const warehouses = [
  { value: 'Main Warehouse', branch: 'Central Branch' },
  { value: 'Market Warehouse', branch: 'Central Branch' },
  { value: 'North Warehouse', branch: 'North Branch' },
  { value: 'Airport Warehouse', branch: 'Airport Branch' },
]

const shopTypes = ['Retail', 'Outlet', 'Counter', 'Kiosk']
const managers = ['Dhiar Khalid', 'Lina Abbas', 'Sara Khan', 'Nadia Islam', 'Ali Hassan', 'Omar Khalid']
const priceLists = ['Standard retail', 'Wholesale', 'Airport']
const statuses = ['Active', 'Inactive']
const documentTypes = ['Shop lease', 'Registration', 'License', 'Tax certificate']

const steps = [
  'Complete required information',
  'Assign branch and responsible staff',
  'Review access and status',
  'Save the record',
]

const emptyForm = {
  name: '',
  code: '',
  branch: '',
  type: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  manager: '',
  warehouse: '',
  priceList: '',
  cashAccount: '',
  openingHours: '',
  status: '',
  documentType: '',
  documentReference: '',
  fileName: '',
  notes: '',
}

function currentUserName() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user?.name || 'Administrator'
  } catch {
    return 'Administrator'
  }
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

function toShop(form) {
  const code = form.code.trim() || nextShopCode()
  const status = form.status || 'Active'
  const today = formatToday()
  const manager = form.manager.trim()
  const warehouse = form.warehouse.trim()

  return {
    id: code,
    code,
    name: form.name.trim(),
    branch: form.branch,
    manager: manager || 'Unassigned',
    status,
    createdBy: currentUserName(),
    createdOn: today,
    updatedOn: today,
    type: form.type.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    warehouse,
    priceList: form.priceList.trim(),
    cashAccount: form.cashAccount.trim(),
    openingHours: form.openingHours.trim(),
    summary: warehouse
      ? `${form.name.trim()} sells from ${warehouse}. Only warehouses in ${form.branch} are available.`
      : 'Select the branch before choosing a linked warehouse. Only warehouses in that branch are available.',
    access: "Sales default to this shop's warehouse and price list. Cash follows the assigned role.",
    employees: manager
      ? [
          {
            id: `${code}-manager`,
            code: 'EMP-NEW',
            name: manager,
            role: 'Shop manager',
            assignment: 'Primary',
            status: 'Active',
          },
        ]
      : [],
  }
}

function AddShopPage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const branchWarehouses = warehouses.filter((item) => item.branch === form.branch)

  function update(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'branch' && current.warehouse) {
        const allowed = warehouses.some((item) => item.branch === value && item.value === current.warehouse)
        if (!allowed) next.warehouse = ''
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
    if (!form.name.trim()) nextErrors.name = 'Enter a shop name.'
    if (!form.branch) nextErrors.branch = 'Select a parent branch.'
    if (!form.address.trim()) nextErrors.address = 'Enter an address.'
    if (form.email.trim() && !form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
    if (form.code.trim() && shopCodeTaken(form.code)) nextErrors.code = 'This shop code is already in use.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function save(andAnother) {
    if (!validate()) return
    const shop = addShopRecord(toShop(form))
    toast.success(`${shop.name} saved.`)
    if (andAnother) {
      setForm(emptyForm)
      setErrors({})
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    navigate('/organization/shop', { state: { selectedId: shop.id } })
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
            <Link to="/organization/shop" className="hover:text-slate-700">
              Shops
            </Link>
            <span>/</span>
            <span className="text-slate-700">Add</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Add Shop</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage retail locations, branch links, sales teams and shop defaults.
          </p>
        </div>
        <Link to="/organization/shop" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2f6fed]">
          <ArrowLeft size={15} />
          Back to Shops
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <FormCard title="Shop information">
            <Field
              label="Shop name"
              required
              value={form.name}
              error={errors.name}
              placeholder="Enter shop name"
              onChange={(value) => update('name', value)}
            />
            <Field
              label="Shop code"
              value={form.code}
              error={errors.code}
              placeholder="Enter shop code"
              onChange={(value) => update('code', value)}
            />
            <SelectField
              label="Parent branch"
              required
              value={form.branch}
              error={errors.branch}
              placeholder="Select parent branch"
              options={parentBranches}
              onChange={(value) => update('branch', value)}
            />
            <SelectField
              label="Shop type"
              value={form.type}
              error={errors.type}
              placeholder="Select shop type"
              options={shopTypes}
              onChange={(value) => update('type', value)}
            />
          </FormCard>

          <FormCard title="Location and contact">
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

          <FormCard title="Sales and assignments">
            <SelectField
              label="Shop manager"
              value={form.manager}
              error={errors.manager}
              placeholder="Select shop manager"
              options={managers}
              onChange={(value) => update('manager', value)}
            />
            <SelectField
              label="Linked warehouse"
              value={form.warehouse}
              error={errors.warehouse}
              placeholder={form.branch ? 'Select linked warehouse' : 'Select parent branch first'}
              options={branchWarehouses}
              disabled={!form.branch}
              onChange={(value) => update('warehouse', value)}
            />
            <SelectField
              label="Price list"
              value={form.priceList}
              error={errors.priceList}
              placeholder="Select price list"
              options={priceLists}
              onChange={(value) => update('priceList', value)}
            />
            <Field
              label="Cash account"
              value={form.cashAccount}
              error={errors.cashAccount}
              placeholder="Enter cash account"
              onChange={(value) => update('cashAccount', value)}
            />
            <Field
              label="Opening hours"
              value={form.openingHours}
              error={errors.openingHours}
              placeholder="Enter opening hours"
              onChange={(value) => update('openingHours', value)}
            />
            <SelectField
              label="Status"
              value={form.status}
              error={errors.status}
              placeholder="Select status"
              options={statuses}
              onChange={(value) => update('status', value)}
            />
          </FormCard>

          <FormCard title="Documents and notes">
            <SelectField
              label="Document type"
              value={form.documentType}
              error={errors.documentType}
              placeholder="Shop lease / registration"
              options={documentTypes}
              onChange={(value) => update('documentType', value)}
            />
            <Field
              label="Document reference"
              value={form.documentReference}
              error={errors.documentReference}
              placeholder="Enter document reference"
              onChange={(value) => update('documentReference', value)}
            />
            <div className="md:col-span-2">
              <span className="text-sm text-slate-700">Upload document</span>
              <p className="mt-1 text-[13px] text-slate-400">
                PDF, JPG or PNG ·{' '}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="font-medium text-[#2f6fed]"
                >
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
              onClick={() => navigate('/organization/shop')}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white"
            >
              Save Shop
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
            <span className="text-rose-500">*</span> Required fields. Select the branch before choosing a linked warehouse.
            Only warehouses in that branch are available.
          </p>
        </div>

        <aside className="space-y-4 ">
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Before you save</h2>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[12px] font-medium text-[#1f9d57]">
                Draft
              </span>
              <p className="text-sm font-medium text-slate-800">Create a record in this workspace</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-slate-500">
              Select the branch before choosing a linked warehouse. Only warehouses in that branch are available.
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
              Sales default to this shop&apos;s warehouse and price list. Cash account follows the assigned role.
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

function SelectField({ label, required = false, value, error, placeholder, options, onChange, disabled = false }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <span className="relative mt-1.5 block">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-8 text-sm outline-none focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-50 ${
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

export default AddShopPage
