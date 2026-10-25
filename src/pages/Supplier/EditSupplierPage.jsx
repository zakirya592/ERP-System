import { useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCurrencies } from '../../queries/currencies/currencies.queries.js'
import { useSupplier, useUpdateSupplier } from '../../queries/suppliers/suppliers.queries.js'
import {
  applySupplierErrors,
  currencyOf,
  formFromSupplier,
  formatDate,
  paymentTermsOptions,
  statusClassName,
  supplierStatuses,
  toSupplierBody,
  withOption,
} from './supplierRecords.js'

function EditSupplierPage() {
  const { id } = useParams()
  const supplierQuery = useSupplier(id)
  const supplier = supplierQuery.data?.data

  if (supplierQuery.isLoading) {
    return <Message>Loading supplier...</Message>
  }

  if (supplierQuery.isError) {
    return (
      <Message className="text-rose-500">
        {supplierQuery.error.response?.data?.message || 'Could not load this supplier.'}
      </Message>
    )
  }

  if (!supplier) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Supplier not found</h1>
        <Link to="/purchases/suppliers" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Suppliers
        </Link>
      </section>
    )
  }

  return <EditSupplierForm key={supplier._id} supplier={supplier} />
}

function EditSupplierForm({ supplier }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const updateSupplier = useUpdateSupplier()
  const currenciesQuery = useCurrencies({ page: 1, limit: 100, search: '', status: 'active' })
  const [form, setForm] = useState(() => formFromSupplier(supplier))
  const [errors, setErrors] = useState({})

  const currency = currencyOf(supplier)
  const currencyOptions = withOption(
    (currenciesQuery.data?.data || []).map((item) => ({
      value: item._id,
      label: item.code ? `${item.code} — ${item.name}` : item.name,
    })),
    form.currencyId,
    currency.code ? `${currency.code} — ${currency.name}` : currency.name,
  )
  const statusLabel =
    supplierStatuses.find((option) => option.value === form.status)?.label || form.status || 'Active'

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

    updateSupplier.mutate(
      { id, ...toSupplierBody(form) },
      {
        onSuccess: (data) => {
          toast.success(data?.message || `${form.name.trim()} updated.`)
          navigate('/purchases/suppliers', { state: { selectedId: id } })
        },
        onError: (error) => {
          applySupplierErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not update the supplier.')
        },
      },
    )
  }

  return (
    <form className="mx-auto max-w-5xl space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
            Edit Supplier
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Update supplier contact details, commercial terms, and payable account mapping.
          </p>
        </div>
        <Link
          to={`/purchases/suppliers/${id}`}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
        >
          View details
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
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
                placeholder="Select currency"
                onChange={(value) => update('currencyId', value)}
                options={currencyOptions}
              />
              <SelectField
                label="Payment terms"
                required
                value={form.paymentTerms}
                error={errors.paymentTerms}
                placeholder="Select payment terms"
                onChange={(value) => update('paymentTerms', value)}
                options={withOption(paymentTermsOptions, form.paymentTerms, supplier.paymentTermsLabel)}
              />
              <Field
                label="Payable account"
                required
                value={form.payableAccount}
                error={errors.payableAccount}
                placeholder="e.g. 2100-0008"
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
          </section>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/purchases/suppliers')}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateSupplier.isPending}
              className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateSupplier.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900">{form.name || supplier.name}</h2>
          <p className="mt-1 text-[13px] text-slate-400">{form.code || supplier.code}</p>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(statusLabel)}`}>
              {statusLabel}
            </span>
          </div>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Currency" value={currency.code || '—'} />
            <SideFact label="Created on" value={formatDate(supplier.createdAt)} />
            <SideFact label="Updated" value={formatDate(supplier.updatedAt)} />
            <SideFact label="Record status" value={statusLabel} />
          </dl>
        </aside>
      </div>
    </form>
  )
}

function Field({
  label,
  required = false,
  value,
  error,
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

function Message({ children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center text-sm font-semibold text-slate-900 shadow-sm ${className}`}
    >
      {children}
    </section>
  )
}

export default EditSupplierPage
