import { useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCurrencies } from '../../queries/currencies/currencies.queries.js'
import { useCreateCustomer } from '../../queries/customers/customers.queries.js'
import {
  applyCustomerErrors,
  currencyLabel,
  customerNote,
  customerStatuses,
  emptyCustomerForm,
  paymentTermsOptions,
  toCustomerBody,
  validateCustomerForm,
} from './customerRecords.js'

function AddCustomerPage() {
  const navigate = useNavigate()
  const createCustomer = useCreateCustomer()
  const currenciesQuery = useCurrencies({ page: 1, limit: 100, search: '', status: 'active' })
  const currencyOptions = (currenciesQuery.data?.data || []).map((item) => ({
    value: item._id,
    label: currencyLabel(item) || item.name,
  }))
  const [form, setForm] = useState(emptyCustomerForm)
  const [errors, setErrors] = useState({})
  const selectedCurrency = currencyOptions.find((option) => option.value === form.currencyId)
  const currencyCode = selectedCurrency?.label || 'PKR'

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateCustomerForm(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    createCustomer.mutate(toCustomerBody(form), {
      onSuccess: (data) => {
        toast.success(data?.message || `${form.name.trim()} saved.`)
        const id = data?.data?._id
        navigate('/sales/customers', { state: id ? { selectedId: id } : undefined })
      },
      onError: (error) => {
        applyCustomerErrors(error, setErrors)
        toast.error(error.response?.data?.message || 'Could not save the customer.')
      },
    })
  }

  return (
    <form className="mx-auto max-w-5xl space-y-4" onSubmit={handleSubmit}>
      <div>
        <button
          type="button"
          onClick={() => navigate('/sales/customers')}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-sky-600"
        >
          <ArrowLeft size={15} />
          Back to Customer
        </button>
        <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
          Organization / Customers
        </p>
        <h1 className="mt-1 text-[28px] leading-none font-semibold tracking-tight text-slate-900">
          Add Customer
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Create a customer record with contact details, commercial terms, and a receivable account.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Customer details</h2>
        <p className="mt-0.5 text-xs text-slate-400">Customer identity and contact information</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Customer code"
            required
            value={form.code}
            error={errors.code}
            placeholder="e.g. C-0187"
            hint="Use a unique code for the customer directory."
            onChange={(value) => update('code', value)}
          />
          <Field
            label="Customer name"
            required
            value={form.name}
            error={errors.name}
            placeholder="e.g. Crescent Retail"
            onChange={(value) => update('name', value)}
          />
          <Field
            label="Contact name"
            value={form.contactName}
            error={errors.contactName}
            placeholder="e.g. Maya Reed"
            onChange={(value) => update('contactName', value)}
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
          Default payment preferences and customer account mapping
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Preferred currency"
            required
            value={form.currencyId}
            error={errors.currencyId}
            hint={`All customer amounts are recorded in ${currencyCode}.`}
            onChange={(value) => update('currencyId', value)}
            options={currencyOptions}
            placeholder="Select currency"
          />
          <Field
            label={`Credit limit (${currencyCode})`}
            value={form.creditLimit}
            error={errors.creditLimit}
            placeholder={`${currencyCode} 25,000.00`}
            hint="Maximum credit allowed for this customer."
            onChange={(value) => update('creditLimit', value)}
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
            className="lg:col-span-2"
            label="Receivable account"
            required
            value={form.receivableAccount}
            error={errors.receivableAccount}
            placeholder="e.g. 1200-0016"
            hint="Link this customer to its appropriate accounts receivable ledger account."
            onChange={(value) => update('receivableAccount', value)}
          />
          <fieldset>
            <legend className="text-sm text-slate-700">
              Status <span className="text-rose-500">*</span>
            </legend>
            <div className="mt-1.5 flex gap-2">
              {customerStatuses.map((option) => {
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
            <p className="mt-1 text-xs text-slate-400">Active customers are available for new sales.</p>
            {errors.status && <p className="mt-1 text-xs text-rose-500">{errors.status}</p>}
          </fieldset>
          <label className="block lg:col-span-3">
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
          <p className="text-sm font-semibold text-[#2f6fed]">Customer record ≠ financial transaction</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">{customerNote}</p>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          <span className="text-rose-500">*</span> Required fields.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/sales/customers')}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createCustomer.isPending}
            className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createCustomer.isPending ? 'Saving...' : 'Save Customer'}
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

export default AddCustomerPage
