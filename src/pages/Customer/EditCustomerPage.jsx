import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCurrencies } from '../../queries/currencies/currencies.queries.js'
import { useCustomer, useUpdateCustomer } from '../../queries/customers/customers.queries.js'
import {
  applyCustomerErrors,
  currencyLabel,
  customerNote,
  customerStatuses,
  formFromCustomer,
  formatDate,
  formatMoney,
  paymentTermsLabel,
  paymentTermsOptions,
  statusClassName,
  toCustomerBody,
  validateCustomerForm,
  withOption,
} from './customerRecords.js'

function EditCustomerPage() {
  const { id } = useParams()
  const customerQuery = useCustomer(id)
  const customer = customerQuery.data?.data

  if (customerQuery.isLoading) {
    return <Message>Loading customer...</Message>
  }

  if (customerQuery.isError) {
    return (
      <Message className="text-rose-500">
        {customerQuery.error.response?.data?.message || 'Could not load this customer.'}
      </Message>
    )
  }

  if (!customer) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Customer not found</h1>
        <Link to="/sales/customers" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Customers
        </Link>
      </section>
    )
  }

  return <EditCustomerForm key={customer._id} customer={customer} />
}

function EditCustomerForm({ customer }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const updateCustomer = useUpdateCustomer()
  const currenciesQuery = useCurrencies({ page: 1, limit: 100, search: '', status: 'active' })
  const [form, setForm] = useState(() => formFromCustomer(customer))
  const [errors, setErrors] = useState({})

  const currencyOptions = withOption(
    (currenciesQuery.data?.data || []).map((item) => ({
      value: item._id,
      label: currencyLabel(item) || item.name,
    })),
    form.currencyId,
    currencyLabel(customer.currencyId),
  )
  const termsOptions = withOption(
    paymentTermsOptions,
    form.paymentTerms,
    paymentTermsLabel(form.paymentTerms, customer.paymentTermsLabel),
  )
  const selectedCurrency = currencyOptions.find((option) => option.value === form.currencyId)
  const currencyCode = selectedCurrency?.label || currencyLabel(customer.currencyId) || 'PKR'
  const statusLabel =
    customerStatuses.find((option) => option.value === form.status)?.label || form.status || 'Active'

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function save(event) {
    event.preventDefault()
    const nextErrors = validateCustomerForm(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    updateCustomer.mutate(
      { id, ...toCustomerBody(form) },
      {
        onSuccess: (data) => {
          toast.success(data?.message || `${form.name.trim()} updated.`)
          navigate('/sales/customers', { state: { selectedId: id } })
        },
        onError: (error) => {
          applyCustomerErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not update the customer.')
        },
      },
    )
  }

  return (
    <form className="mx-auto max-w-5xl space-y-4" onSubmit={save}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Organization / Customers / Edit
          </p>
          <h1 className="mt-1 text-[28px] leading-none font-semibold tracking-tight text-slate-900">
            Edit Customer
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Update contact details, commercial terms, and receivable account mapping.
          </p>
        </div>
        <Link
          to="/sales/customers"
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
        >
          Back to Customers
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Customer details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field
                label="Customer code"
                required
                value={form.code}
                error={errors.code}
                onChange={(value) => update('code', value)}
              />
              <Field
                label="Customer name"
                required
                value={form.name}
                error={errors.name}
                onChange={(value) => update('name', value)}
              />
              <Field
                label="Contact name"
                value={form.contactName}
                error={errors.contactName}
                onChange={(value) => update('contactName', value)}
              />
              <Field
                label="Phone"
                value={form.phone}
                error={errors.phone}
                onChange={(value) => update('phone', value)}
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                error={errors.email}
                onChange={(value) => update('email', value)}
              />
              <Field
                className="md:col-span-2"
                label="Address"
                value={form.address}
                error={errors.address}
                onChange={(value) => update('address', value)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Commercial terms & accounting</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <SelectField
                label="Preferred currency"
                required
                value={form.currencyId}
                error={errors.currencyId}
                options={currencyOptions}
                placeholder="Select currency"
                onChange={(value) => update('currencyId', value)}
              />
              <Field
                label={`Credit limit (${currencyCode})`}
                value={form.creditLimit}
                error={errors.creditLimit}
                onChange={(value) => update('creditLimit', value)}
              />
              <SelectField
                label="Payment terms"
                required
                value={form.paymentTerms}
                error={errors.paymentTerms}
                options={termsOptions}
                placeholder="Select payment terms"
                onChange={(value) => update('paymentTerms', value)}
              />
              <Field
                className="lg:col-span-2"
                label="Receivable account"
                required
                value={form.receivableAccount}
                error={errors.receivableAccount}
                onChange={(value) => update('receivableAccount', value)}
              />
              <SelectField
                label="Status"
                value={form.status}
                error={errors.status}
                options={withOption(customerStatuses, form.status, customer.statusLabel)}
                onChange={(value) => update('status', value)}
              />
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/sales/customers')}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateCustomer.isPending}
              className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateCustomer.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900">{form.name || customer.name}</h2>
          <p className="mt-1 text-[13px] text-slate-400">{form.code || customer.code}</p>
          <div className="mt-3">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(statusLabel)}`}
            >
              {statusLabel}
            </span>
          </div>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Credit limit" value={formatMoney(form.creditLimit || customer.creditLimit, currencyCode)} />
            <SideFact label="Created on" value={formatDate(customer.createdAt)} />
            <SideFact label="Updated" value={formatDate(customer.updatedAt)} />
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
          className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-8 text-sm outline-none focus:border-sky-400 ${
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

export default EditCustomerPage
