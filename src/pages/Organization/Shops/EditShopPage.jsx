import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { mergeShopRegister, shopCodeTaken, updateShopRecord, useAddedShops, useShopOverrides } from './shopRecords.js'
import { shops as seedShops } from './ShopPage.jsx'

const parentBranches = ['Central Branch', 'North Branch', 'Airport Branch']
const warehouses = [
  { value: 'Main Warehouse', branch: 'Central Branch' },
  { value: 'Market Warehouse', branch: 'Central Branch' },
  { value: 'North Warehouse', branch: 'North Branch' },
  { value: 'Airport Warehouse', branch: 'Airport Branch' },
]
const shopTypes = ['Retail outlet', 'Retail', 'Outlet', 'Counter', 'Kiosk']
const managers = ['Omar Khalid', 'Dhiar Khalid', 'Lina Abbas', 'Sara Khan', 'Nadia Islam', 'Ali Hassan']
const priceLists = ['Standard retail', 'Wholesale', 'Airport']
const statuses = ['Active', 'Inactive']
const documentTypes = ['Shop lease / registration', 'Shop lease', 'Registration', 'License', 'Tax certificate']

const statusClass = {
  Active: 'bg-[#e7f8ee] text-[#1f9d57]',
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

function formFromShop(shop) {
  return {
    name: shop.name || '',
    code: shop.code || '',
    branch: shop.branch || '',
    type: shop.type || '',
    address: shop.address || '',
    city: shop.city || '',
    phone: !shop.phone || shop.phone === 'Enter shop phone' ? '' : shop.phone,
    email: shop.email || '',
    manager: shop.manager && shop.manager !== 'Unassigned' ? shop.manager : '',
    warehouse: shop.warehouse || '',
    priceList: shop.priceList || '',
    cashAccount: shop.cashAccount || '',
    openingHours: shop.openingHours || '',
    status: shop.status || 'Active',
    documentType: shop.documentType || '',
    documentReference: shop.documentReference || '',
    fileName: shop.fileName || '',
    notes: shop.notes || '',
  }
}

function toUpdatedShop(shop, form) {
  const manager = form.manager.trim()
  const warehouse = form.warehouse.trim()
  const branchChanged = shop.branch !== form.branch || (shop.warehouse || '') !== warehouse
  return {
    ...shop,
    name: form.name.trim(),
    code: form.code.trim(),
    branch: form.branch,
    type: form.type.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    manager: manager || 'Unassigned',
    warehouse,
    priceList: form.priceList.trim(),
    cashAccount: form.cashAccount.trim(),
    openingHours: form.openingHours.trim(),
    status: form.status || 'Active',
    documentType: form.documentType.trim(),
    documentReference: form.documentReference.trim(),
    fileName: form.fileName.trim(),
    notes: form.notes.trim(),
    updatedOn: formatToday(),
    summary: branchChanged
      ? warehouse
        ? `${form.name.trim()} sells from ${warehouse}. Only warehouses in ${form.branch} are available.`
        : 'Select the branch before choosing a linked warehouse. Only warehouses in that branch are available.'
      : shop.summary,
    employees: (shop.employees || []).map((employee) =>
      employee.role === 'Shop manager' && employee.assignment === 'Primary' && manager
        ? { ...employee, name: manager }
        : employee,
    ),
  }
}

function EditShopPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const addedShops = useAddedShops()
  const overrides = useShopOverrides()
  const shop = mergeShopRegister(addedShops, seedShops, overrides).find((item) => item.id === id || item.code === id) || null
  const [form, setForm] = useState(() => (shop ? formFromShop(shop) : null))
  const [errors, setErrors] = useState({})

  if (!shop || !form) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Shop not found</h1>
        <Link to="/organization/shop" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Shops
        </Link>
      </section>
    )
  }

  const branchWarehouses = warehouses.filter((item) => item.branch === form.branch)
  const warehouseOptions = withCurrent(
    branchWarehouses.map((item) => item.value),
    form.warehouse,
  )

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
    if (!form.name.trim()) nextErrors.name = 'Enter a shop name.'
    if (!form.code.trim()) nextErrors.code = 'Enter a shop code.'
    if (!form.branch) nextErrors.branch = 'Select a parent branch.'
    if (!form.address.trim()) nextErrors.address = 'Enter an address.'
    if (form.email.trim() && !form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
    if (form.code.trim() && shopCodeTaken(form.code, shop.code)) nextErrors.code = 'This shop code is already in use.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function save(event) {
    event.preventDefault()
    if (!validate()) return
    const updated = updateShopRecord(toUpdatedShop(shop, form))
    toast.success(`${updated.name} updated.`)
    navigate(`/organization/shop/${updated.id}`)
  }

  return (
    <form className="space-y-4" onSubmit={save}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <span>Organization</span>
            <span>/</span>
            <Link to="/organization/shop" className="hover:text-slate-700">
              Shops
            </Link>
            <span>/</span>
            <span className="text-slate-700">Update</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Edit Shop</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage retail locations, branch links, sales teams and shop defaults.
          </p>
        </div>
        <Link
          to="/organization/shop"
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
        >
          Back to Shops
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <FormCard title="Shop information">
            <Field label="Shop name" required value={form.name} error={errors.name} placeholder="Enter shop name" onChange={(value) => update('name', value)} />
            <Field label="Shop code" required value={form.code} error={errors.code} placeholder="Enter shop code" onChange={(value) => update('code', value)} />
            <SelectField
              label="Parent branch"
              required
              value={form.branch}
              error={errors.branch}
              placeholder="Select parent branch"
              options={withCurrent(parentBranches, form.branch)}
              onChange={(value) => update('branch', value)}
            />
            <SelectField
              label="Shop type"
              value={form.type}
              placeholder="Select shop type"
              options={withCurrent(shopTypes, form.type)}
              onChange={(value) => update('type', value)}
            />
          </FormCard>

          <FormCard title="Location and contact">
            <Field label="Address" required value={form.address} error={errors.address} placeholder="Enter address" onChange={(value) => update('address', value)} />
            <Field label="City / district" value={form.city} placeholder="Enter city / district" onChange={(value) => update('city', value)} />
            <Field label="Phone" value={form.phone} placeholder="Enter shop phone" onChange={(value) => update('phone', value)} />
            <Field label="Email" type="email" value={form.email} error={errors.email} placeholder="Enter email" onChange={(value) => update('email', value)} />
          </FormCard>

          <FormCard title="Sales and assignments">
            <SelectField
              label="Shop manager"
              value={form.manager}
              placeholder="Select shop manager"
              options={withCurrent(managers, form.manager)}
              onChange={(value) => update('manager', value)}
            />
            <SelectField
              label="Linked warehouse"
              value={form.warehouse}
              placeholder={form.branch ? 'Select linked warehouse' : 'Select parent branch first'}
              options={warehouseOptions}
              disabled={!form.branch}
              onChange={(value) => update('warehouse', value)}
            />
            <SelectField
              label="Price list"
              value={form.priceList}
              placeholder="Select price list"
              options={withCurrent(priceLists, form.priceList)}
              onChange={(value) => update('priceList', value)}
            />
            <Field label="Cash account" value={form.cashAccount} placeholder="Enter cash account" onChange={(value) => update('cashAccount', value)} />
            <Field label="Opening hours" value={form.openingHours} placeholder="Enter opening hours" onChange={(value) => update('openingHours', value)} />
            <SelectField label="Status" value={form.status} placeholder="Select status" options={statuses} onChange={(value) => update('status', value)} />
          </FormCard>

          <FormCard title="Documents and notes">
            <SelectField
              label="Document type"
              value={form.documentType}
              placeholder="Select document type"
              options={withCurrent(documentTypes, form.documentType)}
              onChange={(value) => update('documentType', value)}
            />
            <Field
              label="Document reference"
              value={form.documentReference}
              placeholder="Enter document reference"
              onChange={(value) => update('documentReference', value)}
            />
            <div className="md:col-span-2">
              <span className="text-sm text-slate-700">Uploaded document</span>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(event) => onFile(event.target.files?.[0])}
              />
              {form.fileName ? (
                <p className="mt-1.5 text-sm text-slate-700">
                  {form.fileName} · {fileKind(form.fileName)} ·{' '}
                  <button type="button" onClick={() => toast.success('Document opened.')} className="font-medium text-[#2f6fed]">
                    View
                  </button>
                  {' / '}
                  <button type="button" onClick={() => fileRef.current?.click()} className="font-medium text-[#2f6fed]">
                    Replace
                  </button>
                </p>
              ) : (
                <p className="mt-1 text-[13px] text-slate-400">
                  PDF, JPG or PNG ·{' '}
                  <button type="button" onClick={() => fileRef.current?.click()} className="font-medium text-[#2f6fed]">
                    Choose a file
                  </button>
                </p>
              )}
              {errors.fileName && <p className="mt-1 text-xs text-rose-500">{errors.fileName}</p>}
            </div>
            <label className="block md:col-span-2">
              <span className="text-sm text-slate-700">Internal notes</span>
              <textarea
                value={form.notes}
                rows={3}
                placeholder="Add remarks for authorized workplace admins"
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
            <button type="submit" className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white">
              Save changes
            </button>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Required fields. Select the branch before choosing a linked warehouse. Only warehouses in that branch are available.
          </p>
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900">{form.name || shop.name}</h2>
          <p className="mt-1 text-[13px] text-slate-400">{form.code || shop.code}</p>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClass[form.status] || 'bg-slate-100 text-slate-500'}`}>
              {form.status || 'Active'}
            </span>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{shop.summary}</p>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Created by" value={shop.createdBy || '—'} />
            <SideFact label="Created on" value={shop.createdOn || '—'} />
            <SideFact label="Updated" value={shop.updatedOn || '—'} />
            <SideFact label="Record status" value={form.status || shop.status} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{shop.access}</p>
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

export default EditShopPage
