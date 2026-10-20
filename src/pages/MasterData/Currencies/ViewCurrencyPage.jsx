import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCurrency } from '../../../queries/currencies/currencies.queries'

const statusClass = {
  active: 'bg-emerald-50 text-emerald-600',
  inactive: 'bg-slate-100 text-slate-500',
}

function ViewCurrencyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currencyQuery = useCurrency(id)
  const currency = currencyQuery.data?.data

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/master-data/currency" className="font-medium text-slate-700 hover:text-slate-900">
              Master Data
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-400">Detail</span>
          </nav>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-[32px] leading-none font-semibold tracking-tight text-slate-900">
              {currency?.name || 'Currency'}
            </h1>
            {currency && <StatusPill status={currency.status} />}
          </div>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            {currency
              ? `${currency.code || 'No code'}${currency.symbol ? ` · ${currency.symbol}` : ''}`
              : 'Code, symbol, decimals, and whether this currency is the base.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/master-data/currency"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Back to Currencies
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/master-data/currency/${id}/edit`)}
            className="cursor-pointer rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Update Currency
          </button>
        </div>
      </div>

      {currencyQuery.isLoading && <Panel>Loading currency...</Panel>}
      {currencyQuery.isError && (
        <Panel className="text-rose-500">
          {currencyQuery.error.response?.data?.message || 'Could not load this currency.'}
        </Panel>
      )}

      {currency && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="ISO code" value={currency.code || '—'} hint="Saved in uppercase" mono />
            <Stat label="Symbol" value={currency.symbol || '—'} hint="Shown on amounts" />
            <Stat
              label="Decimal places"
              value={currency.decimalPlaces ?? '—'}
              hint={decimalHint(currency.decimalPlaces)}
            />
            <Stat
              label="Designation"
              value={currency.isBaseCurrency ? 'Base' : 'Foreign'}
              hint={currency.isBaseCurrency ? 'Books are kept in this currency' : 'Used with a document rate'}
              valueClassName={currency.isBaseCurrency ? 'text-[#2f6fed]' : 'text-slate-900'}
            />
          </section>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Currency details</h2>
              <p className="mt-0.5 text-sm text-slate-400">Name, code, symbol, and how amounts are written</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Fact label="Name" value={currency.name} />
                <Fact label="Code" value={currency.code} mono />
                <Fact label="Symbol" value={currency.symbol} />
                <Fact label="Decimal places" value={currency.decimalPlaces} />
                <Fact label="Sample amount" value={sampleAmount(currency.symbol, currency.decimalPlaces)} />
                <Fact label="Designation" value={currency.isBaseCurrency ? 'Base currency' : 'Foreign currency'} />
              </div>
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-[12px] text-slate-400">Amount format</p>
                <p className="mt-1 text-sm text-slate-700">
                  {currency.decimalPlaces == null
                    ? 'Decimal places are not set.'
                    : `Amounts use ${currency.decimalPlaces} decimal ${currency.decimalPlaces === 1 ? 'place' : 'places'}${
                        currency.symbol ? ` and the ${currency.symbol} symbol` : ''
                      }.`}
                </p>
              </div>
            </section>

            <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
              <p className="font-mono text-[13px] text-slate-400">{currency.code || 'No code'}</p>
              <h2 className="mt-1 text-[18px] font-semibold text-slate-900">{currency.name}</h2>
              <div className="mt-3">
                <StatusPill status={currency.status} />
              </div>
              <p className="mt-4 text-[13px] leading-5 text-slate-500">
                {currency.status === 'active'
                  ? 'Available for new documents.'
                  : 'Hidden from new documents until it is set active.'}
              </p>
              <dl className="mt-5 space-y-3.5">
                <SideFact label="Symbol" value={currency.symbol} />
                <SideFact label="Decimal places" value={currency.decimalPlaces} />
                <SideFact label="Base currency" value={currency.isBaseCurrency ? 'Yes' : 'No'} />
                <SideFact label="Created" value={formatWhen(currency.createdAt)} />
                <SideFact label="Updated" value={formatWhen(currency.updatedAt)} />
              </dl>
              <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
                <p className="text-[13px] font-semibold text-[#2f6fed]">
                  {currency.isBaseCurrency ? `Base currency · ${currency.code}` : 'Foreign currency'}
                </p>
                <p className="mt-1 text-[13px] leading-5 text-slate-600">
                  {currency.isBaseCurrency
                    ? `Posted balances and financial statements are maintained in ${currency.code}.`
                    : 'Foreign-currency documents keep this currency and their document exchange rate.'}
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

function sampleAmount(symbol, places) {
  const decimals = Number(places)
  if (!Number.isInteger(decimals) || decimals < 0) return '—'
  const amount = (1234.5).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return symbol ? `${symbol} ${amount}` : amount
}

function decimalHint(places) {
  const decimals = Number(places)
  if (!Number.isInteger(decimals) || decimals < 0) return 'Not set'
  return decimals === 0 ? 'Whole amounts only' : `Example ${sampleAmount('', decimals)}`
}

function formatWhen(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(status) {
  if (!status) return '—'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
        statusClass[status] || 'bg-slate-100 text-slate-500'
      }`}
    >
      {statusLabel(status)}
    </span>
  )
}

function Stat({ label, value, hint, mono = false, valueClassName = 'text-slate-900' }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</p>
      <p className={`mt-3 text-[26px] leading-none font-semibold tracking-tight ${mono ? 'font-mono' : ''} ${valueClassName}`}>
        {value === 0 ? 0 : value || '—'}
      </p>
      {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
    </article>
  )
}

function Panel({ children, className = 'text-slate-400' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white px-6 py-10 text-sm shadow-sm ${className}`}>
      {children}
    </section>
  )
}

function Fact({ label, value, mono = false }) {
  const empty = value == null || value === ''
  return (
    <div className="min-w-0">
      <p className="text-[12px] text-slate-400">{label}</p>
      <p className={`mt-1 text-sm font-medium ${mono ? 'font-mono' : ''} ${empty ? 'text-slate-400' : 'text-slate-800'}`}>
        {empty ? '—' : value}
      </p>
    </div>
  )
}

function SideFact({ label, value }) {
  return (
    <div>
      <dt className="text-[13px] text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-[14px] font-medium text-slate-800">{value === 0 ? 0 : value || '—'}</dd>
    </div>
  )
}

export default ViewCurrencyPage
