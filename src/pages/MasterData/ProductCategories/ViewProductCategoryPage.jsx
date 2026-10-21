import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProductCategories, useProductCategory } from '../../../queries/productCategories/productCategories.queries'
import { formatWhen, parentLabel, statusLabel } from './categoryRecords'

const statusClass = {
  active: 'bg-emerald-50 text-emerald-600',
  inactive: 'bg-slate-100 text-slate-500',
}

function ViewProductCategoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const categoryQuery = useProductCategory(id)
  const lookupQuery = useProductCategories({ page: 1, limit: 100, search: '', status: '' })
  const category = categoryQuery.data?.data
  const lookup = lookupQuery.data?.data || []

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/master-data/categories" className="font-medium text-slate-700 hover:text-slate-900">
              Master Data
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-400">Detail</span>
          </nav>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-[32px] leading-none font-semibold tracking-tight text-slate-900">
              {category?.name || 'Product category'}
            </h1>
            {category && <StatusPill status={category.status} />}
          </div>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            {category
              ? `${category.code || 'No code'} · ${parentLabel(category, lookup) === '—' ? 'Top-level category' : `Under ${parentLabel(category, lookup)}`}`
              : 'Name, code, parent, and whether products can use this category.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/master-data/categories"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Back to Categories
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/master-data/categories/${id}/edit`)}
            className="cursor-pointer rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Update Category
          </button>
        </div>
      </div>

      {categoryQuery.isLoading && <Panel>Loading product category...</Panel>}
      {categoryQuery.isError && (
        <Panel className="text-rose-500">
          {categoryQuery.error.response?.data?.message || 'Could not load this product category.'}
        </Panel>
      )}

      {category && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Stat label="Code" value={category.code || '—'} hint="Saved in uppercase" mono />
            <Stat
              label="Parent"
              value={parentLabel(category, lookup)}
              hint={parentLabel(category, lookup) === '—' ? 'Top-level category' : 'Classified under this parent'}
            />
            <Stat
              label="Status"
              value={statusLabel(category.status)}
              hint={category.status === 'active' ? 'Available for products' : 'Kept for existing products'}
              valueClassName={category.status === 'active' ? 'text-emerald-600' : 'text-slate-900'}
            />
          </section>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Category details</h2>
              <p className="mt-0.5 text-sm text-slate-400">Name, code, parent, and description</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Fact label="Name" value={category.name} />
                <Fact label="Code" value={category.code} mono />
                <Fact label="Parent" value={parentLabel(category, lookup)} muted={parentLabel(category, lookup) === '—'} />
                <Fact label="Status" value={statusLabel(category.status)} />
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-[12px] text-slate-400">Description</p>
                <p className={`mt-1 text-sm leading-6 ${category.description ? 'text-slate-700' : 'text-slate-400'}`}>
                  {category.description || 'No description.'}
                </p>
              </div>
            </section>

            <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
              <p className="font-mono text-[13px] text-slate-400">{category.code || 'No code'}</p>
              <h2 className="mt-1 text-[18px] font-semibold text-slate-900">{category.name}</h2>
              <div className="mt-3">
                <StatusPill status={category.status} />
              </div>
              <p className="mt-4 text-[13px] leading-5 text-slate-500">
                {category.status === 'active'
                  ? 'Available when classifying products.'
                  : 'Hidden from new products until it is set active.'}
              </p>
              <dl className="mt-5 space-y-3.5">
                <SideFact label="Code" value={category.code} />
                <SideFact label="Parent" value={parentLabel(category, lookup)} />
                <SideFact label="Created" value={formatWhen(category.createdAt)} />
                <SideFact label="Updated" value={formatWhen(category.updatedAt)} />
              </dl>
              <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
                <p className="text-[13px] font-semibold text-[#2f6fed]">Product category</p>
                <p className="mt-1 text-[13px] leading-5 text-slate-600">
                  Categories classify products. A parent is optional, and inactive categories stay on existing products.
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
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
        {value || '—'}
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

function Fact({ label, value, mono = false, muted = false }) {
  const empty = value == null || value === '' || value === '—'
  return (
    <div className="min-w-0">
      <p className="text-[12px] text-slate-400">{label}</p>
      <p className={`mt-1 text-sm font-medium ${mono ? 'font-mono' : ''} ${muted || empty ? 'text-slate-400' : 'text-slate-800'}`}>
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

export default ViewProductCategoryPage
