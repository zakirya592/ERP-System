import { useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const categories = [
  'Beverages',
  'Dry Goods',
  'Cleaning',
  'Packaging',
  'Dairy',
  'Groceries',
  'Hygiene',
  'Frozen',
]
const baseUnits = ['pcs', 'bag', 'kg', 'carton', 'can', 'ctn', 'box', 'case']
const packingUnits = ['carton', 'case', 'bag', 'box']

const emptyForm = {
  sku: '',
  name: '',
  barcode: '',
  category: '',
  description: '',
  baseUnit: '',
  packingUnit: '',
  unitsPerPack: '',
  cost: '',
  sale: '',
  reorder: '',
  trackBatch: false,
  trackExpiry: false,
  status: 'Active',
}

function AddProductPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'trackBatch' && !value) next.trackExpiry = false
      if (key === 'packingUnit' && !value) next.unitsPerPack = ''
      return next
    })
    setErrors((current) => ({
      ...current,
      [key]: '',
      ...(key === 'packingUnit' ? { unitsPerPack: '' } : {}),
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (!form.sku.trim()) nextErrors.sku = 'Enter a SKU.'
    if (!form.name.trim()) nextErrors.name = 'Enter a product name.'
    if (!form.category) nextErrors.category = 'Select a category.'
    if (!form.baseUnit) nextErrors.baseUnit = 'Select a base unit.'
    if (form.packingUnit && !form.unitsPerPack.trim()) {
      nextErrors.unitsPerPack = 'Enter base units per packing unit.'
    } else if (form.unitsPerPack.trim() && !(Number(form.unitsPerPack) > 0)) {
      nextErrors.unitsPerPack = 'Enter a quantity greater than 0.'
    }
    if (!isMoney(form.cost)) nextErrors.cost = 'Enter a cost price.'
    if (!isMoney(form.sale)) nextErrors.sale = 'Enter a sale price.'
    if (form.reorder.trim() === '' || Number.isNaN(Number(form.reorder)) || Number(form.reorder) < 0) {
      nextErrors.reorder = 'Enter a reorder level.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    toast.success(`${form.name.trim()} saved.`)
    navigate('/products/products')
  }

  return (
    <form className="mx-auto max-w-5xl space-y-4" onSubmit={handleSubmit}>
      <div>
        <button
          type="button"
          onClick={() => navigate('/products/products')}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-sky-600"
        >
          <ArrowLeft size={15} />
          Back to Products
        </button>
        <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
          Products & Inventory (PKR) / Products
        </p>
        <h1 className="mt-1 text-[28px] leading-none font-semibold tracking-tight text-slate-900">
          Add Product
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Create a product record with identity, units, pricing, and inventory tracking preferences.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Product details</h2>
        <p className="mt-0.5 text-xs text-slate-400">Product identity and classification</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Field
            label="SKU"
            required
            value={form.sku}
            error={errors.sku}
            placeholder="e.g. BEV-1043"
            hint="Use a unique SKU for the product catalog."
            onChange={(value) => update('sku', value)}
          />
          <Field
            className="lg:col-span-2"
            label="Product name"
            required
            value={form.name}
            error={errors.name}
            placeholder="e.g. Arabica Coffee 1 kg"
            onChange={(value) => update('name', value)}
          />
          <SelectField
            className="lg:col-span-2"
            label="Category"
            required
            value={form.category}
            error={errors.category}
            placeholder="Select a category"
            hint="e.g. Beverages / Coffee."
            onChange={(value) => update('category', value)}
            options={categories}
          />
          <Field
            label="Barcode (optional)"
            value={form.barcode}
            placeholder="e.g. 6291101042118"
            hint="Enter or scan the product's barcode, if available."
            onChange={(value) => update('barcode', value)}
          />
          <Field
            style={{ gridColumn: '1 / -1' }}
            label="Description (optional)"
            multiline
            value={form.description}
            placeholder="e.g. Whole-bean Arabica coffee in a sealed 1 kg bag."
            onChange={(value) => update('description', value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Units & packing</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Define how product quantities are measured and converted.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Quantity / base unit"
            required
            value={form.baseUnit}
            error={errors.baseUnit}
            placeholder="Select a base unit"
            hint="e.g. pcs, bag, kg, or ctn. Stock is measured in this unit."
            onChange={(value) => update('baseUnit', value)}
            options={baseUnits}
          />
          <SelectField
            label="Default packing unit (optional)"
            value={form.packingUnit}
            placeholder="Select a packing unit"
            hint="e.g. carton or case. Leave blank to use the base unit only."
            onChange={(value) => update('packingUnit', value)}
            options={packingUnits}
          />
          <Field
            label="Base units per packing unit"
            value={form.unitsPerPack}
            error={errors.unitsPerPack}
            placeholder={form.packingUnit ? 'e.g. 10' : 'Select base unit first'}
            disabled={!form.packingUnit}
            hint="Required only when a default packing unit is selected."
            onChange={(value) => update('unitsPerPack', value)}
          />
        </div>
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500">
          Tracked packing unit = entered quantity in the selected base unit. For example, if the
          base unit is pcs and the packing unit is carton of 10, enter 1 carton = 10 pcs. Stock
          stays in the base unit before selecting a conversion.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Pricing & reorder</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Default stock cost per base unit and the low-stock threshold.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Field
            label="Cost price (PKR)"
            required
            value={form.cost}
            error={errors.cost}
            placeholder="PKR  e.g. 1,250.00"
            hint="Default unit cost for the selected base unit, not a stock valuation."
            onChange={(value) => update('cost', value)}
          />
          <Field
            label="Sale price (PKR)"
            required
            value={form.sale}
            error={errors.sale}
            placeholder="e.g. 45"
            hint="Default selling price per selected base unit."
            onChange={(value) => update('sale', value)}
          />
          <Field
            label="Reorder level"
            required
            value={form.reorder}
            error={errors.reorder}
            placeholder="e.g. 20"
            hint="Quantity in the selected base unit. Enter 0 for no threshold."
            onChange={(value) => update('reorder', value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Tracking & status</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Choose traceability requirements and availability for new transactions.
        </p>
        <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
          <Toggle
            label="Track batch numbers"
            checked={form.trackBatch}
            hint="Off by default. Enable to record batch numbers on stock receipts."
            onChange={(value) => update('trackBatch', value)}
          />
          <Toggle
            label="Track expiry dates"
            checked={form.trackExpiry}
            disabled={!form.trackBatch}
            hint="Off. Enable batch tracking first to record expiry dates per batch."
            onChange={(value) => update('trackExpiry', value)}
          />
          <fieldset>
            <legend className="text-sm font-medium text-slate-800">
              Status <span className="text-rose-500">*</span>
            </legend>
            <div className="mt-1.5 flex gap-2">
              {['Active', 'Inactive'].map((option) => {
                const selected = form.status === option
                return (
                  <label
                    key={option}
                    className={`inline-flex h-10 min-w-28 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm ${
                      selected
                        ? 'border-sky-400 bg-sky-50 text-slate-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option}
                      checked={selected}
                      onChange={() => update('status', option)}
                      className="size-4 accent-blue-600"
                    />
                    {option}
                  </label>
                )
              })}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Active products are available for new transactions.
            </p>
          </fieldset>
        </div>

        <div className="mt-4 rounded-xl bg-[#eaf3ff] px-4 py-3">
          <p className="text-sm font-semibold text-[#2f6fed]">
            Product record ≠ inventory transaction
          </p>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Creating a product does not change inventory or create a stock balance. Stock is
            recorded only through approved/posted inventory transactions.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          <span className="text-rose-500">*</span> Required fields.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/products/products')}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white"
          >
            Save Product
          </button>
        </div>
      </div>
    </form>
  )
}

function isMoney(value) {
  const amount = Number(String(value).replace(/,/g, ''))
  return value.trim() !== '' && !Number.isNaN(amount) && amount >= 0
}

function Field({
  label,
  required = false,
  value,
  error,
  hint,
  placeholder,
  disabled = false,
  multiline = false,
  className = '',
  style,
  onChange,
}) {
  const inputClass = `mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-sky-400 ${
    error ? 'border-rose-300' : 'border-slate-200'
  } ${disabled ? 'cursor-not-allowed bg-slate-50 text-slate-400' : 'text-slate-800'}`

  return (
    <label className={`block ${className}`} style={style}>
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {multiline ? (
        <textarea
          value={value}
          rows={3}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
      {error ? (
        <p className="mt-1 text-xs text-rose-500">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
    </label>
  )
}

function SelectField({
  label,
  required = false,
  value,
  error,
  hint,
  placeholder,
  options,
  className = '',
  style,
  onChange,
}) {
  return (
    <label className={`block ${className}`} style={style}>
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
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
        />
      </span>
      {error ? (
        <p className="mt-1 text-xs text-rose-500">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
    </label>
  )
}

function Toggle({ label, checked, disabled = false, hint, onChange }) {
  return (
    <div className={disabled ? 'opacity-60' : ''}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            checked ? 'bg-[#2563eb]' : 'bg-slate-200'
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
              checked ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export default AddProductPage
