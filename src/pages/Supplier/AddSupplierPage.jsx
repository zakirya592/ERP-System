import { useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCurrencies } from '../../queries/currencies/currencies.queries.js'
import { useCreateSupplier } from '../../queries/suppliers/suppliers.queries.js'
import {
  applySupplierErrors,
  emptySupplierForm,
  paymentTermsOptions,
  supplierStatuses,
  toSupplierBody,
} from './supplierRecords.js'

function AddSupplierPage() {
  const navigate = useNavigate()
  const createSupplier = useCreateSupplier()
  const currenciesQuery = useCurrencies({ page: 1, limit: 100, search: '', status: 'active' })
  const [form, setForm] = useState(emptySupplierForm)
  const [errors, setErrors] = useState({})

  const currencyOptions = (currenciesQuery.data?.data || []).map((currency) => ({
    value: currency._id,
    label: currency.code ? `${currency.code} — ${currency.name}` : currency.name,
  }))

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.code.trim()) nextErrors.code = 'Enter a supplier code.'
    if (!form.name.trim()) nextErrors.name = 'Enter a supplier name.'
    if (!form.currencyId) nextErrors.currencyId = 'Select a currency.'
    if (!form.paymentTerms) nextErrors.paymentTerms = 'Select payment terms.'
    if (!form.payableAccount.trim()) nextErrors.payableAccount = 'Enter a payable account.'
    if (form.email.trim() && !form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    createSupplier.mutate(toSupplierBody(form), {
      onSuccess: (data) => {
        toast.success(data?.message || `${form.name.trim()} saved.`)
        const id = data?.data?._id
        navigate('/purchases/suppliers', { state: id ? { selectedId: id } : undefined })
      },
      onError: (error) => {
        applySupplierErrors(error, setErrors)
        toast.error(error.response?.data?.message || 'Could not save the supplier.')
      },
    })
  }

  const selectedCurrency = currencyOptions.find((option) => option.value === form.currencyId)
  const currencyHint = selectedCurrency?.label?.split(' — ')[0] || 'PKR'

  return (
    <form className="mx-auto max-w-5xl space-y-4" onSubmit={handleSubmit}>
      <div>
        <button
          type="button"
          onClick={() => navigate('/purchases/suppliers')}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-sky-600"
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
            error={errors.phone}
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
            error={errors.address}
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
            value={form.currencyId}
            error={errors.currencyId}
            placeholder={currenciesQuery.isLoading ? 'Loading currencies...' : 'Select currency'}
            hint={`All supplier amounts are recorded in ${currencyHint}.`}
            onChange={(value) => update('currencyId', value)}
            options={currencyOptions}
          />
          <SelectField
            label="Payment terms"
            required
            value={form.paymentTerms}
            error={errors.paymentTerms}
            placeholder="Select payment terms"
            hint="e.g. Cash, Net 7, Net 14, or Net 30."
            onChange={(value) => update('paymentTerms', value)}
            options={paymentTermsOptions}
          />
          <Field
            label="Payable account"
            required
            value={form.payableAccount}
            error={errors.payableAccount}
            placeholder="e.g. 2100-0008"
            hint="Link posted purchases and payments to this supplier's ledger through the payable account."
            onChange={(value) => update('payableAccount', value)}
          />
          <fieldset>
            <legend className="text-sm text-slate-700">
              Status <span className="text-rose-500">*</span>
            </legend>
            <div className="mt-1.5 flex gap-2">
              {supplierStatuses.map((option) => {
                const selected = form.status === option.value

                return (
                  <label
                    key={option.value}
                    className={`inline-flex h-10 min-w-28 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm ${
                      selected
                        ? 'border-sky-400 bg-sky-50 text-slate-800'
                        : 'border-slate-200 bg-white text-slate-600'
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
            <p className="mt-1 text-xs text-slate-400">Active suppliers are available for new purchases.</p>
          </fieldset>
          <label className="block md:col-span-2">
            <span className="text-sm text-slate-700">Notes</span>
            <textarea
              value={form.notes}
              rows={3}
              placeholder="Optional internal notes"
              onChange={(event) => update('notes', event.target.value)}
              className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 ${
                errors.notes ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.notes && <p className="mt-1 text-xs text-rose-500">{errors.notes}</p>}
          </label>
        </div>

        <div className="mt-4 rounded-xl bg-[#eaf3ff] px-4 py-3">
          <p className="text-sm font-semibold text-[#2f6fed]">Supplier record ≠ financial transaction</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            This payable account links posted purchases and payments to the supplier ledger. Creating a
            supplier does not post a financial transaction or create a balance. Payable balances come
            from posted ledger entries.
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
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createSupplier.isPending}
            className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createSupplier.isPending ? 'Saving...' : 'Save Supplier'}
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
            <option key={option.value} value={option.value}>
              {option.label}
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
