import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCreateQuantityUnit } from '../../../queries/quantityUnits/quantityUnits.queries'

const emptyForm = {
  name: '',
  shortCode: '',
  decimalAllowed: true,
  status: 'active',
}

function applyApiErrors(error, setErrors) {
  const apiErrors = error.response?.data?.errors
  if (!Array.isArray(apiErrors)) return
  const fieldErrors = {}
  apiErrors.forEach((item) => {
    if (item.field && !fieldErrors[item.field]) fieldErrors[item.field] = item.message
  })
  setErrors((current) => ({ ...current, ...fieldErrors }))
}

function AddQuantityUnitPage() {
  const navigate = useNavigate()
  const createUnit = useCreateQuantityUnit()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    const name = form.name.trim()
    const shortCode = form.shortCode.trim().toUpperCase()

    if (!name) nextErrors.name = 'Enter a name.'
    if (!shortCode) nextErrors.shortCode = 'Enter a short code.'
    else if (!/^[A-Z0-9]{1,10}$/.test(shortCode)) nextErrors.shortCode = 'Use 1 to 10 letters or numbers, for example KG.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    createUnit.mutate(
      {
        name,
        shortCode,
        decimalAllowed: form.decimalAllowed,
        status: form.status,
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || 'Quantity unit created.')
          navigate('/master-data/units')
        },
        onError: (error) => {
          applyApiErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not save the quantity unit.')
        },
      },
    )
  }

  return (
    <form className="mx-auto max-w-5xl space-y-4" onSubmit={handleSubmit}>
      <div>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/master-data/units" className="font-medium text-slate-700 hover:text-slate-900">
            Quantity Units
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Add Unit</span>
        </nav>
        <h1 className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-slate-900">Add Quantity Unit</h1>
        <p className="mt-2 text-sm text-slate-500">Name the unit and choose whether a partial quantity is allowed.</p>
      </div>

      <UnitFields form={form} errors={errors} update={update} />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          <span className="text-rose-500">*</span> Required fields.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/master-data/units')}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createUnit.isPending}
            className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createUnit.isPending ? 'Saving' : 'Save Unit'}
          </button>
        </div>
      </div>
    </form>
  )
}

export function UnitFields({ form, errors, update }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Quantity unit</h2>
      <p className="mt-0.5 text-xs text-slate-400">Name, short code, and status</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field
          label="Name"
          required
          value={form.name}
          error={errors.name}
          placeholder="e.g. Kilogram"
          onChange={(value) => update('name', value)}
        />
        <Field
          label="Short code"
          required
          value={form.shortCode}
          error={errors.shortCode}
          placeholder="e.g. KG"
          hint="Letters and numbers. Saved in uppercase."
          onChange={(value) => update('shortCode', value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
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
        <label className="flex items-center gap-2 pt-7 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.decimalAllowed}
            onChange={(event) => update('decimalAllowed', event.target.checked)}
            className="size-4 cursor-pointer accent-[#2563eb]"
          />
          Decimal quantities allowed
        </label>
      </div>
    </section>
  )
}

function Field({ label, required = false, value, error, hint, placeholder, onChange }) {
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
      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </label>
  )
}

function SelectField({ label, required = false, value, error, options, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <span className="relative mt-1.5 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-slate-800 outline-none focus:border-sky-400 ${
            error ? 'border-rose-300' : 'border-slate-200'
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
      </span>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

export default AddQuantityUnitPage
