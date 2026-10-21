import { ChevronDown } from 'lucide-react'
import { useProductCategories } from '../../../queries/productCategories/productCategories.queries'
import { parentIdOf } from './categoryRecords'

export function CategoryFields({ form, errors, update, category }) {
  const categoriesQuery = useProductCategories({ page: 1, limit: 100, search: '', status: '' })
  const categories = categoriesQuery.data?.data || []
  const currentId = category?._id
  const options = categories
    .filter((item) => item._id !== currentId)
    .map((item) => ({
      value: item._id,
      label: item.code ? `${item.name} (${item.code})` : item.name,
    }))

  const currentParentId = parentIdOf(category)
  if (currentParentId && !options.some((option) => option.value === currentParentId)) {
    const parent = category?.parentId
    const label = parent && typeof parent === 'object' ? parent.name || 'Current parent' : 'Current parent'
    options.unshift({ value: currentParentId, label })
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Product category</h2>
      <p className="mt-0.5 text-xs text-slate-400">Name, code, parent, and status</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field
          label="Name"
          required
          value={form.name}
          error={errors.name}
          placeholder="e.g. Beverages"
          onChange={(value) => update('name', value)}
        />
        <Field
          label="Code"
          required
          value={form.code}
          error={errors.code}
          placeholder="e.g. CAT-BEV"
          hint="Letters, numbers, and hyphens. Saved in uppercase."
          onChange={(value) => update('code', value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
        />
        <SelectField
          label="Parent category"
          value={form.parentId}
          error={errors.parentId}
          placeholder={categoriesQuery.isLoading ? 'Loading categories...' : 'No parent'}
          hint="Optional. Leave blank for a top-level category."
          options={options}
          onChange={(value) => update('parentId', value)}
        />
        <SelectField
          label="Status"
          required
          value={form.status}
          error={errors.status}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          onChange={(value) => update('status', value)}
        />
        <Field
          className="md:col-span-2"
          label="Description"
          multiline
          value={form.description}
          error={errors.description}
          placeholder="e.g. Coffee, water, and packaged drinks"
          onChange={(value) => update('description', value)}
        />
      </div>
    </section>
  )
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

function SelectField({ label, required = false, value, error, hint, placeholder, options, onChange }) {
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
