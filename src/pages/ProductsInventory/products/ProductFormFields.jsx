import { ChevronDown } from 'lucide-react'
import { usePackingUnits } from '../../../queries/packingUnits/packingUnits.queries'
import { useProductCategories } from '../../../queries/productCategories/productCategories.queries'
import { useQuantityUnits } from '../../../queries/quantityUnits/quantityUnits.queries'
import { refId, refName, unitLabel, withCurrentOption } from './productRecords'

export function ProductFormFields({ form, errors, update, product }) {
  const categoriesQuery = useProductCategories({ page: 1, limit: 100, search: '', status: 'active' })
  const unitsQuery = useQuantityUnits({ page: 1, limit: 100, search: '', status: 'active' })
  const packsQuery = usePackingUnits({
    page: 1,
    limit: 100,
    search: '',
    status: 'active',
    quantityUnitId: form.quantityUnitId,
  })

  const categories = withCurrentOption(
    (categoriesQuery.data?.data || []).map((category) => ({
      value: category._id,
      label: category.code ? `${category.name} (${category.code})` : category.name,
    })),
    product?.categoryId,
    (category) => (category.code ? `${category.name} (${category.code})` : refName(category) || 'Current category'),
  )

  const quantityUnits = withCurrentOption(
    (unitsQuery.data?.data || []).map((unit) => ({
      value: unit._id,
      label: unitLabel(unit),
    })),
    product?.quantityUnitId,
    unitLabel,
  )

  const keepCurrentPack = refId(product?.quantityUnitId) === form.quantityUnitId
  const packingUnits = withCurrentOption(
    (form.quantityUnitId ? packsQuery.data?.data || [] : []).map((unit) => ({
      value: unit._id,
      label: unit.conversionQuantity ? `${unitLabel(unit)} · ${unit.conversionQuantity}` : unitLabel(unit),
    })),
    keepCurrentPack ? product?.packingUnitId : null,
    unitLabel,
  )

  const selectedPack = (packsQuery.data?.data || []).find((unit) => unit._id === form.packingUnitId) || product?.packingUnitId
  const selectedQuantity = (unitsQuery.data?.data || []).find((unit) => unit._id === form.quantityUnitId) || product?.quantityUnitId

  function changeQuantityUnit(value) {
    update('quantityUnitId', value)
    update('packingUnitId', '')
  }

  return (
    <>
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
            value={form.categoryId}
            error={errors.categoryId}
            placeholder={categoriesQuery.isLoading ? 'Loading categories...' : 'Select a category'}
            hint="Choose the product category."
            onChange={(value) => update('categoryId', value)}
            options={categories}
          />
          <Field
            label="Barcode (optional)"
            value={form.barcode}
            error={errors.barcode}
            placeholder="e.g. 6291101042118"
            hint="Leave blank when the product has no barcode."
            onChange={(value) => update('barcode', value)}
          />
          <Field
            className="lg:col-span-3"
            label="Description (optional)"
            multiline
            value={form.description}
            error={errors.description}
            placeholder="e.g. Whole-bean Arabica coffee in a sealed 1 kg bag."
            onChange={(value) => update('description', value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Units & packing</h2>
        <p className="mt-0.5 text-xs text-slate-400">Stock is counted in the quantity unit. A packing unit is optional.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SelectField
            label="Quantity unit"
            required
            value={form.quantityUnitId}
            error={errors.quantityUnitId}
            placeholder={unitsQuery.isLoading ? 'Loading quantity units...' : 'Select a quantity unit'}
            hint="Stock is measured in this unit."
            onChange={changeQuantityUnit}
            options={quantityUnits}
          />
          <SelectField
            label="Packing unit (optional)"
            value={form.packingUnitId}
            error={errors.packingUnitId}
            placeholder={
              !form.quantityUnitId
                ? 'Select a quantity unit first'
                : packsQuery.isLoading
                  ? 'Loading packing units...'
                  : 'No packing unit'
            }
            hint={packHint(selectedPack, selectedQuantity)}
            disabled={!form.quantityUnitId}
            onChange={(value) => update('packingUnitId', value)}
            options={packingUnits}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Pricing & reorder</h2>
        <p className="mt-0.5 text-xs text-slate-400">Default prices and the low-stock threshold, in the quantity unit.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Field
            label="Cost price (PKR)"
            required
            value={form.costPrice}
            error={errors.costPrice}
            placeholder="e.g. 10.50"
            hint="Default unit cost for the quantity unit."
            onChange={(value) => update('costPrice', value)}
          />
          <Field
            label="Sale price (PKR)"
            required
            value={form.salePrice}
            error={errors.salePrice}
            placeholder="e.g. 15.00"
            hint="Default selling price for the quantity unit."
            onChange={(value) => update('salePrice', value)}
          />
          <Field
            label="Reorder level"
            required
            value={form.reorderLevel}
            error={errors.reorderLevel}
            placeholder="e.g. 20"
            hint="Quantity in the selected unit. Enter 0 for no threshold."
            onChange={(value) => update('reorderLevel', value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Tracking & status</h2>
        <p className="mt-0.5 text-xs text-slate-400">Choose traceability requirements and availability for new transactions.</p>
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
            hint={
              form.trackBatch
                ? 'Record an expiry date with each batch.'
                : 'Enable batch tracking first to record expiry dates.'
            }
            onChange={(value) => update('trackExpiry', value)}
          />
          <fieldset>
            <legend className="text-sm font-medium text-slate-800">
              Status <span className="text-rose-500">*</span>
            </legend>
            <div className="mt-1.5 flex gap-2">
              {[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ].map((option) => {
                const selected = form.status === option.value
                return (
                  <label
                    key={option.value}
                    className={`inline-flex h-10 min-w-28 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm ${
                      selected ? 'border-sky-400 bg-sky-50 text-slate-800' : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={selected}
                      onChange={() => update('status', option.value)}
                      className="size-4 accent-blue-600"
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
            <p className="mt-1 text-xs text-slate-400">Active products are available for new transactions.</p>
          </fieldset>
        </div>

        <div className="mt-4 rounded-xl bg-[#eaf3ff] px-4 py-3">
          <p className="text-sm font-semibold text-[#2f6fed]">Product record ≠ inventory transaction</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Saving a product does not change inventory or create a stock balance. Stock is recorded only through
            approved inventory transactions.
          </p>
        </div>
      </section>
    </>
  )
}

function packHint(pack, quantityUnit) {
  if (!pack || typeof pack === 'string' || !pack.conversionQuantity) {
    return 'Leave blank to stock this product in the quantity unit only.'
  }
  const base = quantityUnit && typeof quantityUnit !== 'string' ? quantityUnit.shortCode || quantityUnit.name : 'units'
  return `1 ${pack.shortCode || pack.name} = ${pack.conversionQuantity} ${base}.`
}

function Field({ label, required = false, value, error, hint, placeholder, multiline = false, className = '', onChange }) {
  const inputClass = `mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 ${
    error ? 'border-rose-300' : 'border-slate-200'
  }`

  return (
    <label className={`block ${className}`}>
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
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
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
  disabled = false,
  className = '',
  onChange,
}) {
  return (
    <label className={`block ${className} ${disabled ? 'opacity-70' : ''}`}>
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <span className="relative mt-1.5 block">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-sky-400 ${
            error ? 'border-rose-300' : 'border-slate-200'
          } ${value ? 'text-slate-800' : 'text-slate-400'} ${disabled ? 'cursor-not-allowed bg-slate-50' : ''}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
      </span>
      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
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
