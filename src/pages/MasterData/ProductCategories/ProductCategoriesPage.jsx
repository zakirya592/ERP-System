import { useEffect, useState } from 'react'
import { ChevronDown, Eye, Pencil, Plus, Search, Upload } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { useProductCategories } from '../../../queries/productCategories/productCategories.queries.js'
import MasterDataTabs from '../MasterDataTabs.jsx'
import { parentLabel } from './categoryRecords.js'

const limit = 20

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

function StatusPill({ status }) {
  const active = status === 'active'
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
        active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {active ? 'Active' : status ? 'Inactive' : '—'}
    </span>
  )
}

function ProductCategoriesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  const categoriesQuery = useProductCategories({ page, limit, search: debouncedSearch, status })
  const lookupQuery = useProductCategories({ page: 1, limit: 100, search: '', status: '' })
  const lookup = lookupQuery.data?.data || []
  const categories = (categoriesQuery.data?.data || []).map((category) => ({ ...category, id: category._id }))
  const total = categoriesQuery.data?.meta?.total ?? categories.length
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, total)
  const summary =
    total <= limit
      ? `Showing all ${total} ${total === 1 ? 'category' : 'categories'}`
      : `Showing ${rangeStart} to ${rangeEnd} of ${total} categories`

  function clearFilters() {
    setSearch('')
    setStatus('')
    setPage(1)
  }

  const columns = [
    {
      key: 'code',
      label: 'CODE',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-500">{item.code || '—'}</span>,
    },
    {
      key: 'name',
      label: 'CATEGORY',
      isRowHeader: true,
      renderCell: (item) => (
        <button
          type="button"
          onClick={() => navigate(`/master-data/categories/${item._id}`)}
          className="cursor-pointer text-[13px] text-slate-700"
        >
          {item.name}
        </button>
      ),
    },
    {
      key: 'parent',
      label: 'PARENT',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{parentLabel(item, lookup)}</span>,
    },
    {
      key: 'status',
      label: 'STATUS',
      renderCell: (item) => <StatusPill status={item.status} />,
    },
    {
      key: 'action',
      label: '',
      className: 'text-right',
      cellClassName: 'text-right',
      renderCell: (item) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`View ${item.name}`}
            onClick={() => navigate(`/master-data/categories/${item._id}`)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            aria-label={`Update ${item.name}`}
            onClick={() => navigate(`/master-data/categories/${item._id}/edit`)}
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Master Data</span>
          </nav>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Master Data</h1>
          <p className="mt-2 text-sm text-slate-500">Maintain currencies, units, conversions, and business classification lists.</p>
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
            onClick={() => navigate('/master-data/categories/new')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            <Plus size={15} />
            Add Category
          </button>
        </div>
      </div>

      <MasterDataTabs />

      <div className="rounded-xl bg-[#eef4ff] px-4 py-3">
        <p className="text-sm font-semibold text-[#2f6fed]">Product categories</p>
        <p className="mt-0.5 text-[13px] text-slate-500">
          Categories classify products. A parent is optional, and inactive categories stay on existing products.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-slate-900">Product category register</h2>
          <p className="mt-0.5 text-[13px] text-slate-400">Codes, names, parents, and which categories are active.</p>
        </div>

        <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
          <label className="relative w-full sm:w-72">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search category or code"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <label className="relative">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Status"
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-9 pl-3 text-sm text-slate-700 outline-none focus:border-sky-400 sm:w-40"
            >
              {statusOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
          </label>
          <button type="button" onClick={clearFilters} className="cursor-pointer px-2 py-2 text-sm font-medium text-[#2f6fed]">
            Clear filters
          </button>
        </div>

        <GlobalTable
          ariaLabel="Product categories"
          columns={columns}
          data={categories}
          pagination
          rowsPerPage={limit}
          page={page}
          totalCount={total}
          onPageChange={setPage}
          summary={summary}
          contentClassName="min-w-[760px]"
          className="h-auto! max-h-none!"
          emptyContent={
            categoriesQuery.isError
              ? categoriesQuery.error.response?.data?.message || 'Could not load product categories.'
              : categoriesQuery.isLoading
                ? 'Loading product categories...'
                : 'No product categories match these filters.'
          }
        />
      </section>
    </div>
  )
}

export default ProductCategoriesPage
