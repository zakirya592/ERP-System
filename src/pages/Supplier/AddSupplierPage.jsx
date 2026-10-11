import { useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const currencies = ['PKR', 'USD']
const paymentTerms = ['Cash', 'Net 7', 'Net 14', 'Net 30']
const payableAccounts = [
  '2100-0012',
  '2100-0033',
  '2100-0042',
  '2100-0055',
  '2100-0078',
  '2100-0091',
  '2100-0104',
  '2100-0120',
]

const emptyForm = {
  code: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  currency: 'PKR',
  terms: '',
  account: '',
  status: 'Active',
}

function AddSupplierPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (!form.code.trim()) nextErrors.code = 'Enter a supplier code.'
    if (!form.name.trim()) nextErrors.name = 'Enter a supplier name.'
    if (!form.currency) nextErrors.currency = 'Select a currency.'
    if (!form.terms) nextErrors.terms = 'Select payment terms.'
    if (!form.account) nextErrors.account = 'Select a payable account.'
    if (form.email.trim() && !form.email.includes('@')) nextErrors.email = 'Enter a valid email.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    toast.success(`${form.name.trim()} saved.`)
    navigate('/purchases/suppliers')
  }

  return (
    <form className="mx-auto max-w-5xl space-y-4" onSubmit={handleSubmit}>
      <div>
        <button
          type="button"
          onClick={() => navigate('/purchases/suppliers')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 cursor-pointer"
        >
          <ArrowLeft size={15} />
          Back to Supplier
        </button>
        <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
          Organization / Supplier
        </p>
        <h1 className="mt-1 text-[28px] leading-none font-semibold tracking-tight text-slate-900">
          Add Supplier
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Create a supplier record with contact details, commercial terms, and a payable account.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Supplier details</h2>
        <p className="mt-0.5 text-xs text-slate-400">Supplier identity and contact information</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Supplier code"
            required
            value={form.code}
            error={errors.code}
            placeholder="e.g. S-0035"
            hint="Use a unique code for the supplier directory."
            onChange={(value) => update('code', value)}
          />
          <Field
            label="Supplier / business name"
            required
            value={form.name}
            error={errors.name}
            placeholder="e.g. Crescent Wholesale"
            onChange={(value) => update('name', value)}
          />
          <Field
            label="Phone"
            value={form.phone}
            placeholder="e.g. +92 300 1234567"
            onChange={(value) => update('phone', value)}
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            error={errors.email}
            placeholder="e.g. accounts@example.com"
            onChange={(value) => update('email', value)}
          />
          <Field
            className="md:col-span-2"
            label="Address"
            value={form.address}
            placeholder="Street address, area, city, and postal code"
            onChange={(value) => update('address', value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Commercial terms & accounting</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Default payment preferences and supplier account mapping
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <SelectField
            label="Preferred currency"
            required
            value={form.currency}
            error={errors.currency}
            hint={`All supplier amounts are recorded in ${form.currency || 'PKR'}.`}
            onChange={(value) => update('currency', value)}
            options={currencies}
          />
          <SelectField
            label="Payment terms"
            required
            value={form.terms}
            error={errors.terms}
            placeholder="Select payment terms"
            hint="e.g. Cash, Net 7, Net 14, or Net 30."
            onChange={(value) => update('terms', value)}
            options={paymentTerms}
          />
          <SelectField
            label="Payable account"
            required
            value={form.account}
            error={errors.account}
            placeholder="Select a supplier payable account"
            hint="Link posted purchases and payments to this supplier's ledger through the payable account."
            onChange={(value) => update('account', value)}
            options={payableAccounts}
          />
          <fieldset>
            <legend className="text-sm text-slate-700">
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
              Active suppliers are available for new purchases.
            </p>
          </fieldset>
        </div>

        <div className="mt-4 rounded-xl bg-[#eaf3ff] px-4 py-3">
          <p className="text-sm font-semibold text-[#2f6fed]">
            Supplier record ≠ financial transaction
          </p>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            This payable account links posted purchases and payments to the supplier ledger.
            Creating a supplier does not post a financial transaction or create a balance. Payable
            balances come from posted ledger entries.
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
            onClick={() => navigate('/purchases/suppliers')}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white cursor-pointer"
          >
            Save Supplier
          </button>
        </div>
      </div>
    </form>
  )
}

function Field({
  label,
  required = false,
  value,
  error,
  hint,
  placeholder,
  type = 'text',
  className = '',
  onChange,
}) {
  return (
    <label className={`block ${className}`}>
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
  onChange,
}) {
  return (
    <label className={`block ${className}`}>
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

export default AddSupplierPage
