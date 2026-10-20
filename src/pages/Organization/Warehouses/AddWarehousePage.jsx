import { useRef, useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { addWarehouseRecord, nextWarehouseCode, warehouseCodeTaken } from './warehouseRecords.js'

const parentBranches = ['Central Branch', 'North Branch', 'Airport Branch']
const warehouseTypes = ['Finished goods', 'Raw materials', 'Transit', 'Quarantine', 'Mixed']
const custodians = ['Omar Khalid', 'Sara Khan', 'Hafiz Salman', 'Ali Hassan', 'Lina Abbas', 'Nadia Islam']
const stockAccounts = ['Inventory — finished goods', 'Inventory — raw materials', 'Inventory — transit']
const defaultZones = ['Zone A', 'Zone B', 'QC Hold']
const binTrackingOptions = ['Enabled', 'Disabled']
const negativeStockOptions = ['Blocked', 'Allowed']
const statuses = ['Active', 'Inactive']
const documentTypes = ['Warehouse layout / lease', 'Lease', 'Registration', 'License']

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
  phone: '',
  floorArea: '',
  storageCapacity: '',
  custodian: '',
  stockAccount: '',
  defaultZone: '',
  binTracking: '',
  negativeStock: '',
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

function toWarehouse(form) {
  const code = form.code.trim() || nextWarehouseCode()
  const status = form.status || 'Active'
  const today = formatToday()
  const custodian = form.custodian.trim()

  return {
    id: code,
    code,
    name: form.name.trim(),
    branch: form.branch,
    type: form.type.trim(),
    custodian,
    status,
    address: form.address.trim(),
    phone: form.phone.trim(),
    floorArea: form.floorArea.trim(),
    storageCapacity: form.storageCapacity.trim(),
    stockAccount: form.stockAccount.trim(),
    defaultZone: form.defaultZone.trim(),
    binTracking: form.binTracking.trim(),
    negativeStock: form.negativeStock.trim(),
    documentType: form.documentType.trim(),
    documentReference: form.documentReference.trim(),
    fileName: form.fileName.trim(),
    notes: form.notes.trim(),
    createdBy: currentUserName(),
    createdOn: today,
    updatedOn: today,
    summary: 'Warehouse access is scoped to the parent branch. A location with stock or open transfers cannot be archived.',
    access: 'Quality hold stock remains visible but unavailable for normal dispatch.',
    zones: [],
  }
}

function AddWarehousePage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
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
    if (!form.name.trim()) nextErrors.name = 'Enter a warehouse name.'
    if (!form.branch) nextErrors.branch = 'Select a parent branch.'
    if (!form.address.trim()) nextErrors.address = 'Enter an address.'
    if (!form.custodian) nextErrors.custodian = 'Select a custodian.'
    if (form.code.trim() && warehouseCodeTaken(form.code)) nextErrors.code = 'This warehouse code is already in use.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function save(andAnother) {
    if (!validate()) return
    const warehouse = addWarehouseRecord(toWarehouse(form))
    toast.success(`${warehouse.name} saved.`)
    if (andAnother) {
      setForm(emptyForm)
      setErrors({})
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    navigate('/organization/warehouses', { state: { selectedId: warehouse.id } })
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
              Organization
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
            <Field
              label="Warehouse name"
              required
              value={form.name}
              error={errors.name}
              placeholder="Enter warehouse name"
              onChange={(value) => update('name', value)}
            />
            <Field
              label="Warehouse code"
              value={form.code}
              error={errors.code}
              placeholder="Enter warehouse code"
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
              label="Warehouse type"
              value={form.type}
              placeholder="Select warehouse type"
              options={warehouseTypes}
              onChange={(value) => update('type', value)}
            />
          </FormCard>

          <FormCard title="Location and capacity">
            <Field
              label="Address"
              required
              value={form.address}
              error={errors.address}
              placeholder="Enter address"
              onChange={(value) => update('address', value)}
            />
            <Field
              label="Contact phone"
              value={form.phone}
              placeholder="Enter contact phone"
              onChange={(value) => update('phone', value)}
            />
            <Field
              label="Floor area"
              value={form.floorArea}
              placeholder="Enter floor area"
              onChange={(value) => update('floorArea', value)}
            />
            <Field
              label="Storage capacity"
              value={form.storageCapacity}
              placeholder="Enter storage capacity"
              onChange={(value) => update('storageCapacity', value)}
            />
          </FormCard>

          <FormCard title="Stock controls and access">
            <SelectField
              label="Custodian"
              required
              value={form.custodian}
              error={errors.custodian}
              placeholder="Select custodian"
              options={custodians}
              onChange={(value) => update('custodian', value)}
            />
            <SelectField
              label="Default stock account"
              value={form.stockAccount}
              placeholder="Select default stock account"
              options={stockAccounts}
              onChange={(value) => update('stockAccount', value)}
            />
            <SelectField
              label="Default zone"
              value={form.defaultZone}
              placeholder="Select default zone"
              options={defaultZones}
              onChange={(value) => update('defaultZone', value)}
            />
            <SelectField
              label="Bin tracking"
              value={form.binTracking}
              placeholder="Select bin tracking"
              options={binTrackingOptions}
              onChange={(value) => update('binTracking', value)}
            />
            <SelectField
              label="Negative stock"
              value={form.negativeStock}
              placeholder="Select negative stock"
              options={negativeStockOptions}
              onChange={(value) => update('negativeStock', value)}
            />
            <SelectField
              label="Status"
              value={form.status}
              placeholder="Select status"
              options={statuses}
              onChange={(value) => update('status', value)}
            />
          </FormCard>

          <FormCard title="Documents and notes">
            <SelectField
              label="Document type"
              value={form.documentType}
              placeholder="Select document type"
              options={documentTypes}
              onChange={(value) => update('documentType', value)}
            />
            <Field
              label="Document reference"
              value={form.documentReference}
              placeholder="Enter document reference"
              onChange={(value) => update('documentReference', value)}
            />
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
              onClick={() => navigate('/organization/warehouses')}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button type="submit" className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white">
              Save Warehouse
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
            <span className="text-rose-500">*</span> Required fields. Warehouse access is scoped to the parent branch. A location with stock or open transfers cannot be archived.
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
            <p className="mt-2 text-[13px] leading-5 text-slate-500">
              Warehouse access is scoped to the parent branch. A location with stock or open transfers cannot be archived.
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
              Quality hold stock remains visible but unavailable for normal dispatch.
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

export default AddWarehousePage
