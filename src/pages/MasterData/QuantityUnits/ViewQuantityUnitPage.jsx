import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuantityUnit } from '../../../queries/quantityUnits/quantityUnits.queries'

const statusClass = {
  active: 'bg-emerald-50 text-emerald-600',
  inactive: 'bg-slate-100 text-slate-500',
}

function ViewQuantityUnitPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const unitQuery = useQuantityUnit(id)
  const unit = unitQuery.data?.data

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/master-data/units" className="font-medium text-slate-700 hover:text-slate-900">
              Master Data
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-400">Detail</span>
          </nav>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-[32px] leading-none font-semibold tracking-tight text-slate-900">
              {unit?.name || 'Quantity unit'}
            </h1>
            {unit && <StatusPill status={unit.status} />}
          </div>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            {unit
              ? `${unit.shortCode || 'No code'} · ${unit.decimalAllowed ? 'Decimals allowed' : 'Whole quantities only'}`
              : 'Name, short code, and whether a partial quantity can be recorded.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/master-data/units"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Back to Units
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/master-data/units/${id}/edit`)}
            className="cursor-pointer rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Update Unit
          </button>
        </div>
      </div>

      {unitQuery.isLoading && <Panel>Loading quantity unit...</Panel>}
      {unitQuery.isError && (
        <Panel className="text-rose-500">
          {unitQuery.error.response?.data?.message || 'Could not load this quantity unit.'}
        </Panel>
      )}

      {unit && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Stat label="Short code" value={unit.shortCode || '—'} hint="Saved in uppercase" mono />
            <Stat
              label="Decimals"
              value={unit.decimalAllowed ? 'Allowed' : 'Whole'}
              hint={unit.decimalAllowed ? 'Partial quantities can be recorded' : 'Only whole quantities'}
              valueClassName={unit.decimalAllowed ? 'text-[#2f6fed]' : 'text-slate-900'}
            />
            <Stat label="Sample quantity" value={sampleQuantity(unit)} hint="How a quantity is written" />
          </section>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Unit details</h2>
              <p className="mt-0.5 text-sm text-slate-400">Name, short code, and how quantities are entered</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Fact label="Name" value={unit.name} />
                <Fact label="Short code" value={unit.shortCode} mono />
                <Fact label="Decimals" value={unit.decimalAllowed ? 'Allowed' : 'Whole quantities only'} />
                <Fact label="Sample quantity" value={sampleQuantity(unit)} />
                <Fact label="Status" value={statusLabel(unit.status)} />
              </div>
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-[12px] text-slate-400">Quantity entry</p>
                <p className="mt-1 text-sm text-slate-700">
                  {unit.decimalAllowed
                    ? `Stock, purchases, and sales can use a partial ${unit.name || 'quantity'}, such as ${sampleQuantity(unit)}.`
                    : `Stock, purchases, and sales use whole ${unit.name || 'quantities'} only, such as ${sampleQuantity(unit)}.`}
                </p>
              </div>
            </section>

            <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
              <p className="font-mono text-[13px] text-slate-400">{unit.shortCode || 'No code'}</p>
              <h2 className="mt-1 text-[18px] font-semibold text-slate-900">{unit.name}</h2>
              <div className="mt-3">
                <StatusPill status={unit.status} />
              </div>
              <p className="mt-4 text-[13px] leading-5 text-slate-500">
                {unit.status === 'active'
                  ? 'Available when measuring stock, purchases, and sales.'
                  : 'Hidden from new records until it is set active.'}
              </p>
              <dl className="mt-5 space-y-3.5">
                <SideFact label="Short code" value={unit.shortCode} />
                <SideFact label="Decimals" value={unit.decimalAllowed ? 'Allowed' : 'Whole quantities only'} />
                <SideFact label="Created" value={formatWhen(unit.createdAt)} />
                <SideFact label="Updated" value={formatWhen(unit.updatedAt)} />
              </dl>
              <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
                <p className="text-[13px] font-semibold text-[#2f6fed]">Quantity unit</p>
                <p className="mt-1 text-[13px] leading-5 text-slate-600">
                  Units measure stock, purchases, and sales. A unit that allows decimals can record a partial quantity.
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

function sampleQuantity(unit) {
  const code = unit.shortCode || unit.name || ''
  const amount = unit.decimalAllowed ? '12.50' : '12'
  return code ? `${amount} ${code}` : amount
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
      <dd className="mt-0.5 text-[14px] font-medium text-slate-800">{value || '—'}</dd>
    </div>
  )
}

export default ViewQuantityUnitPage
