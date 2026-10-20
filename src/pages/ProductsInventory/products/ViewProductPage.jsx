import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProduct } from '../../../queries/products/products.queries'
import { formatWhen, money, refName, statusLabel, unitLabel } from './productRecords'

const statusClass = {
  active: 'bg-emerald-50 text-emerald-600',
  inactive: 'bg-slate-100 text-slate-500',
}

function ViewProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const productQuery = useProduct(id)
  const product = productQuery.data?.data
  const prices = product ? priceSummary(product) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-slate-400"
          >
             <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
            Dashboard
          </Link>
            <span>/</span>
            <Link to="/products/products" className="font-medium text-slate-700 hover:text-slate-900">
              Products & Inventory
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-400">Detail</span>
          </nav>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-[32px] leading-none font-semibold tracking-tight text-slate-900">
              {product?.name || 'Product'}
            </h1>
            {product && (
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                  statusClass[product.status] || 'bg-slate-100 text-slate-500'
                }`}
              >
                {statusLabel(product.status)}
              </span>
            )}
          </div>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            {product
              ? `${product.sku || 'No SKU'}${refName(product.categoryId) ? ` · ${refName(product.categoryId)}` : ''}`
              : 'Product identity, units, pricing, and tracking.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/products/products"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Back to Products
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/products/products/${id}/edit`)}
            className="cursor-pointer rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Update Product
          </button>
        </div>
      </div>

      {productQuery.isLoading && <Panel>Loading product...</Panel>}
      {productQuery.isError && (
        <Panel className="text-rose-500">
          {productQuery.error.response?.data?.message || 'Could not load this product.'}
        </Panel>
      )}

      {product && prices && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Cost price" value={`PKR ${money(product.costPrice)}`} hint="Per quantity unit" />
            <Stat label="Sale price" value={`PKR ${money(product.salePrice)}`} hint="Per quantity unit" />
            <Stat
              label="Margin"
              value={prices.marginLabel}
              hint={prices.marginHint}
              valueClassName={prices.margin >= 0 ? 'text-emerald-600' : 'text-rose-500'}
            />
            <Stat label="Reorder level" value={displayQuantity(product.reorderLevel)} hint="In the quantity unit" />
          </section>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Product details</h2>
                <p className="mt-0.5 text-sm text-slate-400">Identity and classification</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Fact label="SKU" value={product.sku} mono />
                  <Fact label="Product name" value={product.name} />
                  <Fact label="Barcode" value={product.barcode} muted={!product.barcode} mono />
                  <Fact label="Category" value={refName(product.categoryId)} />
                  <Fact label="Category code" value={product.categoryId?.code} mono />
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-[12px] text-slate-400">Description</p>
                  <p className={`mt-1 text-sm leading-6 ${product.description ? 'text-slate-700' : 'text-slate-400'}`}>
                    {product.description || 'No description.'}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Units & packing</h2>
                <p className="mt-0.5 text-sm text-slate-400">How this product is counted and packed</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Fact label="Quantity unit" value={unitLabel(product.quantityUnitId)} />
                  <Fact
                    label="Packing unit"
                    value={product.packingUnitId ? unitLabel(product.packingUnitId) : 'Quantity unit only'}
                    muted={!product.packingUnitId}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Tracking</h2>
                <p className="mt-0.5 text-sm text-slate-400">What must be recorded when stock is received</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Flag
                    label="Batch numbers"
                    on={product.trackBatch}
                    detail={product.trackBatch ? 'Record a batch on each receipt.' : 'Batch numbers are not required.'}
                  />
                  <Flag
                    label="Expiry dates"
                    on={product.trackExpiry}
                    detail={product.trackExpiry ? 'Record an expiry date with each batch.' : 'Expiry dates are not required.'}
                  />
                </div>
              </section>
            </div>

            <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
              <p className="font-mono text-[13px] text-slate-400">{product.sku || 'No SKU'}</p>
              <h2 className="mt-1 text-[18px] font-semibold text-slate-900">{product.name}</h2>
              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                    statusClass[product.status] || 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {statusLabel(product.status)}
                </span>
              </div>
              <p className="mt-4 text-[13px] leading-5 text-slate-500">
                {product.status === 'active'
                  ? 'Available for new transactions.'
                  : 'Hidden from new transactions until it is set active.'}
              </p>
              <dl className="mt-5 space-y-3.5">
                <SideFact label="Category" value={categoryLine(product.categoryId)} />
                <SideFact label="Quantity unit" value={unitLabel(product.quantityUnitId)} />
                <SideFact
                  label="Packing unit"
                  value={product.packingUnitId ? unitLabel(product.packingUnitId) : 'None'}
                />
                <SideFact label="Created" value={formatWhen(product.createdAt)} />
                <SideFact label="Updated" value={formatWhen(product.updatedAt)} />
              </dl>
              <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
                <p className="text-[13px] font-semibold text-[#2f6fed]">Product record ≠ stock balance</p>
                <p className="mt-1 text-[13px] leading-5 text-slate-600">
                  This record holds identity and default prices. Stock is posted only through inventory transactions.
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

function priceSummary(product) {
  const cost = Number(product.costPrice)
  const sale = Number(product.salePrice)
  if (Number.isNaN(cost) || Number.isNaN(sale)) {
    return { margin: 0, marginLabel: '—', marginHint: 'Needs a cost and a sale price' }
  }
  const margin = sale - cost
  const percent = sale === 0 ? 0 : (margin / sale) * 100
  const sign = margin < 0 ? '-' : margin > 0 ? '+' : ''
  return {
    margin,
    marginLabel: `${sign}PKR ${money(Math.abs(margin))}`,
    marginHint: `${percent.toLocaleString('en-US', { maximumFractionDigits: 1 })}% of sale price`,
  }
}

function displayQuantity(value) {
  if (value == null || value === '') return '—'
  const amount = Number(value)
  if (Number.isNaN(amount)) return String(value)
  return amount.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function categoryLine(category) {
  if (!category || typeof category === 'string') return category || '—'
  return category.code ? `${category.name} (${category.code})` : category.name || '—'
}

function Stat({ label, value, hint, valueClassName = 'text-slate-900' }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</p>
      <p className={`mt-3 text-[26px] leading-none font-semibold tracking-tight ${valueClassName}`}>{value}</p>
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

function Fact({ label, value, muted = false, mono = false }) {
  const empty = value == null || value === ''
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

function Flag({ label, on, detail }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
            on ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-slate-500'
          }`}
        >
          {on ? 'On' : 'Off'}
        </span>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
    </div>
  )
}

export default ViewProductPage
