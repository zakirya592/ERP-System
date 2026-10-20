import { useRef, useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  mergeWarehouseRegister,
  updateWarehouseRecord,
  useAddedWarehouses,
  useWarehouseOverrides,
  warehouseCodeTaken,
} from './warehouseRecords.js'
import { warehouses as seedWarehouses } from './WarehousePage.jsx'

const parentBranches = ['Central Branch', 'North Branch', 'Airport Branch']
const warehouseTypes = ['Finished goods', 'Raw materials', 'Transit', 'Quarantine', 'Mixed']
const custodians = ['Omar Khalid', 'Sara Khan', 'Hafiz Salman', 'Ali Hassan', 'Lina Abbas', 'Nadia Islam']
const stockAccounts = ['Inventory — finished goods', 'Inventory — raw materials', 'Inventory — transit']
const defaultZones = ['Zone A', 'Zone B', 'QC Hold']
const binTrackingOptions = ['Enabled', 'Disabled']
const negativeStockOptions = ['Blocked', 'Allowed']
const statuses = ['Active', 'Inactive']
const documentTypes = ['Warehouse layout / lease', 'Lease', 'Registration', 'License']

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

function formFromWarehouse(warehouse) {
  return {
    name: warehouse.name || '',
    code: warehouse.code || '',
    branch: warehouse.branch || '',
    type: warehouse.type || '',
    address: warehouse.address || '',
    phone: warehouse.phone || '',
    floorArea: warehouse.floorArea || '',
    storageCapacity: warehouse.storageCapacity || '',
    custodian: warehouse.custodian && warehouse.custodian !== 'Unassigned' ? warehouse.custodian : '',
    stockAccount: warehouse.stockAccount || '',
    defaultZone: warehouse.defaultZone || '',
    binTracking: warehouse.binTracking || '',
    negativeStock: warehouse.negativeStock || '',
    status: warehouse.status || 'Active',
    documentType: warehouse.documentType || '',
    documentReference: warehouse.documentReference || '',
    fileName: warehouse.fileName || '',
    notes: warehouse.notes || '',
  }
}

function toUpdatedWarehouse(warehouse, form) {
  const custodian = form.custodian.trim()
  const branchChanged = warehouse.branch !== form.branch
  const custodianChanged = (warehouse.custodian || '') !== custodian
  return {
    ...warehouse,
    name: form.name.trim(),
    code: form.code.trim(),
    branch: form.branch,
    type: form.type.trim(),
    address: form.address.trim(),
    phone: form.phone.trim(),
    floorArea: form.floorArea.trim(),
    storageCapacity: form.storageCapacity.trim(),
    custodian: custodian || 'Unassigned',
    stockAccount: form.stockAccount.trim(),
    defaultZone: form.defaultZone.trim(),
    binTracking: form.binTracking.trim(),
    negativeStock: form.negativeStock.trim(),
    status: form.status || 'Active',
    documentType: form.documentType.trim(),
    documentReference: form.documentReference.trim(),
    fileName: form.fileName.trim(),
    notes: form.notes.trim(),
    updatedOn: formatToday(),
    summary: branchChanged
      ? 'Warehouse access is scoped to the parent branch. A location with stock or open transfers cannot be archived.'
      : warehouse.summary,
    access:
      custodianChanged || branchChanged
        ? `${custodian || 'No custodian'} is assigned. Stock stays inside ${form.branch}.`
        : warehouse.access,
  }
}

function EditWarehousePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const addedWarehouses = useAddedWarehouses()
  const overrides = useWarehouseOverrides()
  const warehouse =
    mergeWarehouseRegister(addedWarehouses, seedWarehouses, overrides).find((item) => item.id === id || item.code === id) ||
    null
  const [form, setForm] = useState(() => (warehouse ? formFromWarehouse(warehouse) : null))
  const [errors, setErrors] = useState({})

  if (!warehouse || !form) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Warehouse not found</h1>
        <Link to="/organization/warehouses" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Warehouses
        </Link>
      </section>
    )
  }

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
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
    if (!form.name.trim()) nextErrors.name = 'Enter a warehouse name.'
    if (!form.code.trim()) nextErrors.code = 'Enter a warehouse code.'
    if (!form.branch) nextErrors.branch = 'Select a parent branch.'
    if (!form.address.trim()) nextErrors.address = 'Enter an address.'
    if (!form.custodian) nextErrors.custodian = 'Select a custodian.'
    if (form.code.trim() && warehouseCodeTaken(form.code, warehouse.code)) {
      nextErrors.code = 'This warehouse code is already in use.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function save(event) {
    event.preventDefault()
    if (!validate()) return
    const updated = updateWarehouseRecord(toUpdatedWarehouse(warehouse, form))
    toast.success(`${updated.name} updated.`)
    navigate(`/organization/warehouses/${updated.id}`)
  }

  return (
    <form className="space-y-4" onSubmit={save}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
            <span className="text-slate-700">Edit</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Edit Warehouse</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage storage locations, custodians, zones and stock access.
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
              required
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
              options={withCurrent(parentBranches, form.branch)}
              onChange={(value) => update('branch', value)}
            />
            <SelectField
              label="Warehouse type"
              value={form.type}
              placeholder="Select warehouse type"
              options={withCurrent(warehouseTypes, form.type)}
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
              options={withCurrent(custodians, form.custodian)}
              onChange={(value) => update('custodian', value)}
            />
            <SelectField
              label="Default stock account"
              value={form.stockAccount}
              placeholder="Select default stock account"
              options={withCurrent(stockAccounts, form.stockAccount)}
              onChange={(value) => update('stockAccount', value)}
            />
            <SelectField
              label="Default zone"
              value={form.defaultZone}
              placeholder="Select default zone"
              options={withCurrent(defaultZones, form.defaultZone)}
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
              <span className="text-sm text-slate-700">Upload document</span>
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
                  </button>{' '}
                  to attach supporting evidence.
                </p>
              )}
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
              Save changes
            </button>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Required fields. Warehouse access is scoped to the parent branch. A location with stock or open transfers cannot be archived.
          </p>
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-4">
          <h2 className="text-[18px] font-semibold text-slate-900">{form.name || warehouse.name}</h2>
          <p className="mt-1 text-[13px] text-slate-400">{form.code || warehouse.code}</p>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClass[form.status] || 'bg-slate-100 text-slate-500'}`}>
              {form.status || 'Active'}
            </span>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{warehouse.summary}</p>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Created by" value={warehouse.createdBy || '—'} />
            <SideFact label="Created on" value={warehouse.createdOn || '—'} />
            <SideFact label="Updated" value={warehouse.updatedOn || '—'} />
            <SideFact label="Record status" value={(form.status || warehouse.status).toUpperCase()} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{warehouse.access}</p>
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

function SideFact({ label, value }) {
  return (
    <div>
      <dt className="text-[13px] text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-[14px] font-medium text-slate-800">{value}</dd>
    </div>
  )
}

export default EditWarehousePage
