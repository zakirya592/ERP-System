import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePackingUnit } from '../../../queries/packingUnits/packingUnits.queries'

const statusClass = {
  active: 'bg-emerald-50 text-emerald-600',
  inactive: 'bg-slate-100 text-slate-500',
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

function quantityUnitLabel(unit) {
  const linked = unit?.quantityUnitId
  if (!linked) return '—'
  if (typeof linked === 'string') return linked
  return linked.shortCode ? `${linked.name} (${linked.shortCode})` : linked.name || '—'
}

function ViewPackingUnitPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const unitQuery = usePackingUnit(id)
  const unit = unitQuery.data?.data

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
        <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
          Dashboard
        </Link>
        <span>/</span>
        <Link to="/master-data/packing-units" className="font-medium text-slate-700 hover:text-slate-900">
          Packing Units
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-700">View Packing Unit</span>
      </nav>

      {unitQuery.isLoading && (
        <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-10 text-sm text-slate-400 shadow-sm">
          Loading packing unit...
        </section>
      )}

      {unitQuery.isError && (
        <section className="rounded-2xl border border-rose-100 bg-white px-6 py-8 text-sm text-rose-500 shadow-sm">
          {unitQuery.error.response?.data?.message || 'Could not load this packing unit.'}
        </section>
      )}

      {unit && (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1d4ed8] text-lg font-semibold text-white">
                {unit.shortCode || 'P'}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[26px] leading-none font-semibold tracking-tight text-slate-900">{unit.name}</h1>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize ${
                      statusClass[unit.status] || 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>
                <p className="mt-1.5 font-mono text-sm text-slate-500">{unit.shortCode}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/master-data/packing-units/${unit._id}/edit`)}
              className="inline-flex w-fit cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white"
            >
              Update
            </button>
          </div>

          <dl className="grid gap-px bg-slate-100 sm:grid-cols-2">
            <Fact label="Short code" value={unit.shortCode} />
            <Fact label="Conversion quantity" value={unit.conversionQuantity} />
            <Fact label="Quantity unit" value={quantityUnitLabel(unit)} />
            <Fact label="Status" value={unit.status} />
            <Fact label="Created" value={formatWhen(unit.createdAt)} />
            <Fact label="Updated" value={formatWhen(unit.updatedAt)} />
          </dl>
        </section>
      )}
    </div>
  )
}

function Fact({ label, value }) {
  return (
    <div className="bg-white px-6 py-4">
      <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-800 capitalize">{value || '—'}</dd>
    </div>
  )
}

export default ViewPackingUnitPage
