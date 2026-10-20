import { useEffect, useState } from 'react'
import { Boxes, ChevronDown, CircleDollarSign, Download, Eye, Pencil, Plus, Search, Trash2, TriangleAlert, Upload } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { sidebarMenu } from '../../../components/sidebarMenu.js'
import { useProductCategories } from '../../../queries/productCategories/productCategories.queries.js'
import { useProducts } from '../../../queries/products/products.queries.js'
import { money, refName, statusLabel, unitLabel } from './productRecords.js'

const limit = 20

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const statusClass = {
  active: 'bg-emerald-50 text-emerald-600',
  inactive: 'bg-slate-100 text-slate-500',
}

const tabs = sidebarMenu.find((item) => item.key === 'products')?.children || []

function ProductPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, categoryId])

  const productsQuery = useProducts({ page, limit, search: debouncedSearch, status, categoryId })
  const activeQuery = useProducts({ page: 1, limit: 1, search: '', status: 'active', categoryId: '' })
  const inactiveQuery = useProducts({ page: 1, limit: 1, search: '', status: 'inactive', categoryId: '' })
  const categoriesQuery = useProductCategories({ page: 1, limit: 100, search: '', status: '' })

  const products = (productsQuery.data?.data || []).map((product) => ({ ...product, id: product._id }))
  const categories = categoriesQuery.data?.data || []
  const total = productsQuery.data?.meta?.total ?? 0
  const activeTotal = activeQuery.data?.meta?.total
  const inactiveTotal = inactiveQuery.data?.meta?.total
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, total)
  const summary =
    total <= limit
      ? `Showing all ${total} ${total === 1 ? 'product' : 'products'}`
      : `Showing ${rangeStart} to ${rangeEnd} of ${total} products`

  function clearFilters() {
    setSearch('')
    setStatus('')
    setCategoryId('')
    setPage(1)
  }

  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.sku || '—'}</span>,
    },
    {
      key: 'name',
      label: 'Product',
      isRowHeader: true,
      renderCell: (item) => (
        <button
          type="button"
          onClick={() => navigate(`/products/products/${item._id}`)}
          className="cursor-pointer text-left text-[13px] font-medium text-slate-800"
        >
          {item.name}
        </button>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      renderCell: (item) => <span className="text-[13px] text-slate-500">{refName(item.categoryId) || '—'}</span>,
    },
    {
      key: 'unit',
      label: 'Unit',
      renderCell: (item) => <span className="text-[13px] text-slate-500">{unitLabel(item.quantityUnitId)}</span>,
    },
    {
      key: 'cost',
      label: 'Cost',
      className: 'text-right',
      cellClassName: 'text-right',
      renderCell: (item) => <span className="text-[13px] text-slate-700">{money(item.costPrice)}</span>,
    },
    {
      key: 'sale',
      label: 'Sale',
      className: 'text-right',
      cellClassName: 'text-right',
      renderCell: (item) => <span className="text-[13px] text-slate-700">{money(item.salePrice)}</span>,
    },
    {
      key: 'reorder',
      label: 'Reorder',
      className: 'text-right',
      cellClassName: 'text-right',
      renderCell: (item) => <span className="text-[13px] text-slate-700">{item.reorderLevel ?? '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      renderCell: (item) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
            statusClass[item.status] || 'bg-slate-100 text-slate-500'
          }`}
        >
          {statusLabel(item.status)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      renderCell: (item) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`View ${item.name}`}
            onClick={() => navigate(`/products/products/${item._id}`)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            aria-label={`Update ${item.name}`}
            onClick={() => navigate(`/products/products/${item._id}/edit`)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Pencil size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Products & Inventory (PKR)
          </p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Products</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage product identity, pricing, and stock availability across operating locations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.success('Import opened.')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            <Upload size={15} />
            Import
          </button>
          <button
            type="button"
            onClick={() => toast.success('Product catalog exported.')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            <Download size={15} />
            Export
          </button>
          <button
            type="button"
            onClick={() => navigate('/products/products/new')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            <Plus size={15} />
            Add Product
          </button>
        </div>
      </div>

      <div className="inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-[#e6edf5] p-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm ${
                isActive ? 'bg-white font-medium text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active products"
          value={countLabel(activeTotal, activeQuery)}
          hint="+42 this month"
          hintClassName="text-emerald-500"
          hintAside
          hintPill
          icon={Boxes}
          iconClass="text-sky-500"
        />
        <StatCard
          label="Inventory value"
          value="PKR 684,290"
          hint="at PKR cost"
          hintClassName="text-slate-400"
          icon={CircleDollarSign}
          iconClass="text-emerald-500"
        />
        <StatCard
          label="Low stock"
          value="248"
          valueClassName="text-amber-500"
          hint="6.4% of catalog"
          hintClassName="text-amber-500"
          hintAside
          icon={TriangleAlert}
          iconClass="text-amber-500"
        />
        <StatCard
          label="Inactive"
          value={countLabel(inactiveTotal, inactiveQuery)}
          hint="review needed"
          hintClassName="text-slate-400"
          icon={Trash2}
          iconClass="text-slate-400"
        />
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Product catalog</h2>
          <p className="mt-0.5 text-sm text-slate-400">{summary}</p>
        </div>

        <div className="flex flex-col gap-2 px-5 py-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, SKU, or barcode"
              className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <FilterSelect
            value={categoryId}
            onChange={setCategoryId}
            ariaLabel="Category"
            options={[
              { label: categoriesQuery.isLoading ? 'Loading categories...' : 'All categories', value: '' },
              ...categories.map((category) => ({
                value: category._id,
                label: category.code ? `${category.name} (${category.code})` : category.name,
              })),
            ]}
          />
          <FilterSelect value={status} onChange={setStatus} ariaLabel="Status" options={statusOptions} />
          <button type="button" onClick={clearFilters} className="cursor-pointer px-2 py-2 text-sm font-medium text-[#2f6fed]">
            Clear filters
          </button>
        </div>

        <GlobalTable
          ariaLabel="Product catalog"
          columns={columns}
          data={products}
          pagination
          rowsPerPage={limit}
          page={page}
          totalCount={total}
          onPageChange={setPage}
          summary={summary}
          contentClassName="min-w-[860px]"
          className="h-auto! max-h-none!"
          emptyContent={
            productsQuery.isError
              ? productsQuery.error.response?.data?.message || 'Could not load products.'
              : productsQuery.isLoading
                ? 'Loading products...'
                : 'No products match these filters.'
          }
          rowClassName="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
        />
      </section>
    </div>
  )
}

function countLabel(total, query) {
  if (typeof total === 'number') return total.toLocaleString('en-US')
  if (query.isError) return '—'
  return '...'
}

function StatCard({
  label,
  value,
  hint,
  hintClassName,
  valueClassName = 'text-slate-900',
  icon: Icon,
  iconClass,
  hintAside = false,
  hintPill = false,
}) {
  const hintNode = (
    <p
      className={`text-xs font-medium whitespace-nowrap ${
        hintPill ? 'rounded-full bg-emerald-50 px-2 py-0.5' : ''
      } ${hintClassName}`}
    >
      {hint}
    </p>
  )

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</p>
        <Icon size={16} className={iconClass} />
      </div>
      {hintAside ? (
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className={`text-[28px] leading-none font-semibold tracking-tight ${valueClassName}`}>{value}</p>
          <div className="mb-0.5">{hintNode}</div>
        </div>
      ) : (
        <>
          <p className={`mt-3 text-[28px] leading-none font-semibold tracking-tight ${valueClassName}`}>{value}</p>
          <div className="mt-2">{hintNode}</div>
        </>
      )}
    </article>
  )
}

function FilterSelect({ value, onChange, options, ariaLabel }) {
  return (
    <label className="relative">
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-9 pl-3 text-sm text-slate-700 outline-none focus:border-sky-400 lg:w-48"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
    </label>
  )
}

export default ProductPage
