import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCurrency, useUpdateCurrency } from '../../../queries/currencies/currencies.queries'

const emptyForm = {
  name: '',
  code: '',
  symbol: '',
  decimalPlaces: '2',
  isBaseCurrency: false,
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

function UpdateCurrencyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currencyQuery = useCurrency(id)
  const updateCurrency = useUpdateCurrency()
  const currency = currencyQuery.data?.data
  const [form, setForm] = useState(emptyForm)
  const [ready, setReady] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!currency || ready) return
    setForm({
      name: currency.name || '',
      code: currency.code || '',
      symbol: currency.symbol || '',
      decimalPlaces: currency.decimalPlaces == null ? '2' : String(currency.decimalPlaces),
      isBaseCurrency: Boolean(currency.isBaseCurrency),
      status: currency.status || 'active',
    })
    setReady(true)
  }, [currency, ready])

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    const name = form.name.trim()
    const code = form.code.trim().toUpperCase()
    const symbol = form.symbol.trim()
    const decimalPlaces = Number(form.decimalPlaces)

    if (!name) nextErrors.name = 'Enter a name.'
    if (!code) nextErrors.code = 'Enter a code.'
    else if (!/^[A-Z]{2,10}$/.test(code)) nextErrors.code = 'Use 2 to 10 letters, for example PKR.'
    if (!symbol) nextErrors.symbol = 'Enter a symbol.'
    if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 8) {
      nextErrors.decimalPlaces = 'Enter a whole number from 0 to 8.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    updateCurrency.mutate(
      {
        id,
        name,
        code,
        symbol,
        decimalPlaces,
        isBaseCurrency: form.isBaseCurrency,
        status: form.status,
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || 'Currency updated.')
          navigate(`/master-data/currency`)
        },
        onError: (error) => {
          applyApiErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not update the currency.')
        },
      },
    )
  }

  return (
    <form className="mx-auto max-w-5xl space-y-4" onSubmit={handleSubmit}>
      <div>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link to="/dashboard" className="hover:text-slate-700">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/master-data/currency" className="hover:text-slate-700">
            Currencies
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Update Currency</span>
        </nav>
        <h1 className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-slate-900">Update Currency</h1>
        <p className="mt-2 text-sm text-slate-500">Change the name, code, symbol, decimals, and status.</p>
      </div>

      {currencyQuery.isLoading && (
        <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-10 text-sm text-slate-400 shadow-sm">
          Loading currency...
        </section>
      )}

      {currencyQuery.isError && (
        <section className="rounded-2xl border border-rose-100 bg-white px-6 py-8 text-sm text-rose-500 shadow-sm">
          {currencyQuery.error.response?.data?.message || 'Could not load this currency.'}
        </section>
      )}

      {ready && (
        <>
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Currency</h2>
            <p className="mt-0.5 text-xs text-slate-400">Name, code, symbol, and status</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field
                label="Name"
                required
                value={form.name}
                error={errors.name}
                placeholder="e.g. Pakistani Rupee"
                onChange={(value) => update('name', value)}
              />
              <Field
                label="Code"
                required
                value={form.code}
                error={errors.code}
                placeholder="e.g. PKR"
                hint="Letters only. Saved in uppercase."
                onChange={(value) => update('code', value.toUpperCase().replace(/[^A-Z]/g, ''))}
              />
              <Field
                label="Symbol"
                required
                value={form.symbol}
                error={errors.symbol}
                placeholder="e.g. Rs"
                onChange={(value) => update('symbol', value)}
              />
              <Field
                label="Decimal places"
                required
                type="number"
                value={form.decimalPlaces}
                error={errors.decimalPlaces}
                placeholder="2"
                hint="Whole number from 0 to 8."
                onChange={(value) => update('decimalPlaces', value)}
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
                  checked={form.isBaseCurrency}
                  onChange={(event) => update('isBaseCurrency', event.target.checked)}
                  className="size-4 cursor-pointer accent-[#2563eb]"
                />
                Base currency
              </label>
            </div>
          </section>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              <span className="text-rose-500">*</span> Required fields.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(`/master-data/currency/${id}`)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateCurrency.isPending}
                className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateCurrency.isPending ? 'Saving' : 'Save Currency'}
              </button>
            </div>
          </div>
        </>
      )}
    </form>
  )
}

function Field({ label, required = false, value, error, hint, placeholder, type = 'text', onChange }) {
  return (
    <label className="block">
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

export default UpdateCurrencyPage
