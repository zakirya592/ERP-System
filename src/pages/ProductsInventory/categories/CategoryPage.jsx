import { useEffect, useMemo, useState } from 'react'
import { Button } from '@heroui/react'
import { ArrowRight, ArrowUpRight, ChevronRight, CircleCheck, ClipboardList, Eye, GitBranch, Pencil, Plus, Search, Tag, Trash2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ExportButton from '../../../components/ExportButton.jsx'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { useProductCategories, useUpdateProductCategory } from '../../../queries/productCategories/productCategories.queries.js'
import { useProducts } from '../../../queries/products/products.queries.js'
import { parentIdOf } from '../../MasterData/ProductCategories/categoryRecords.js'
import InventoryTabs from '../InventoryTabs.jsx'

function categoryColumns(selectedId, navigate) {
  return [
    {
      key: 'code',
      label: 'Code',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.code}</span>,
    },
    {
      key: 'name',
      label: 'Category',
      isRowHeader: true,
      renderCell: (item) => (
        <span className="inline-flex min-w-0 items-center" style={{ marginLeft: `${(item.depth || 0) * 18}px` }}>
          <span className="mr-2 text-[16px] leading-none text-slate-300">·</span>
          <Link
            to={`/products/categories/${item.id}`}
            onClick={(event) => event.stopPropagation()}
            className={`text-[13px] font-semibold ${item.id === selectedId ? 'text-[#2f6fed]' : 'text-slate-800'}`}
          >
            {item.name}
          </Link>
        </span>
      ),
    },
    {
      key: 'parent',
      label: 'Parent category',
      renderCell: (item) => <span className="text-[13px] text-slate-500">{item.parent}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      renderCell: (item) => (
        <span className={`text-[13px] font-medium ${item.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      className: 'text-right',
      cellClassName: 'text-right',
      renderCell: (item) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`View ${item.name}`}
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/products/categories/${item.id}`)
            }}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            aria-label={`Update ${item.name}`}
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/products/categories/${item.id}/edit`)
            }}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Pencil size={16} />
          </button>
        </div>
      ),
    },
  ]
}
function parentName(item, list) {
  const parentId = parentIdOf(item)
  if (!parentId) return '—'
  return list.find((entry) => entry._id === parentId)?.name || '—'
}

function nestCategories(items) {
  const byParent = new Map()
  items.forEach((item) => {
    const key = item.parentId || ''
    const group = byParent.get(key) || []
    group.push(item)
    byParent.set(key, group)
  })
  byParent.forEach((group) => group.sort((a, b) => a.name.localeCompare(b.name)))

  const ordered = []
  const seen = new Set()
  function walk(parentId, depth) {
    ;(byParent.get(parentId) || []).forEach((item) => {
      if (seen.has(item.id)) return
      seen.add(item.id)
      ordered.push({ ...item, depth })
      walk(item.id, depth + 1)
    })
  }

  walk('', 0)
  items.forEach((item) => {
    if (seen.has(item.id)) return
    seen.add(item.id)
    const depth = item.parentId ? 1 : 0
    ordered.push({ ...item, depth })
    walk(item.id, depth + 1)
  })
  return ordered
}

function CategoryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const categoriesQuery = useProductCategories({ page: 1, limit: 100, search: '', status: '' })
  const updateCategory = useUpdateProductCategory()
  const categories = useMemo(() => {
    const source = categoriesQuery.data?.data || []
    const mapped = source.map((item) => ({
      id: item._id,
      code: item.code || '',
      name: item.name || '',
      parentId: parentIdOf(item),
      parent: parentName(item, source),
      status: item.status === 'active' ? 'Active' : 'Inactive',
      statusValue: item.status || 'inactive',
    }))
    return nestCategories(mapped)
  }, [categoriesQuery.data])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [parent, setParent] = useState('All parents')
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || '')
  const parents = useMemo(
    () => ['All parents', ...new Set(categories.map((item) => item.parent).filter((value) => value !== '—'))],
    [categories],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return categories.filter((item) => {
      const matchesQuery =
        !needle ||
        item.code.toLowerCase().includes(needle) ||
        item.name.toLowerCase().includes(needle)
      const matchesStatus =
        status === 'all' || item.status.toLowerCase() === status
      const matchesParent = parent === 'All parents' || item.parent === parent
      return matchesQuery && matchesStatus && matchesParent
    })
  }, [categories, query, status, parent])

  useEffect(() => {
    if (!filtered.some((category) => category.id === selectedId)) {
      setSelectedId(filtered[0]?.id || '')
    }
  }, [filtered, selectedId])

  const selected = categories.find((category) => category.id === selectedId)
  const children = selected ? categories.filter((item) => item.parentId === selected.id) : []
  const shownActive = filtered.filter((item) => item.status === 'Active').length
  const shownInactive = filtered.length - shownActive

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/products/products" className="font-medium text-slate-700 hover:text-slate-900">
              Products & Inventory
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-400">Categories</span>
          </nav>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">
            Categories
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Maintain product classifications, parent categories, and active status across branches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            filename="inventory-categories"
            sheetName="Categories"
            columns={categoryColumns(selectedId, navigate)}
            rows={filtered}
          />
          <Button size="sm" onPress={() => navigate('/products/categories/new')}>
            <Plus size={15} />
            Add Category
          </Button>
        </div>
      </div>

      <InventoryTabs />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total categories" value={String(categories.length)} hint="Complete register" icon={ClipboardList} />
        <Metric
          label="Active"
          value={String(categories.filter((item) => item.status === 'Active').length)}
          hint="Available for classification"
          icon={CircleCheck}
        />
        <Metric
          label="Inactive"
          value={String(categories.filter((item) => item.status !== 'Active').length)}
          hint="Historical references retained"
          icon={Trash2}
        />
        <Metric
          label="Top-level categories"
          value={String(categories.filter((item) => item.parent === '—').length)}
          hint={`${categories.filter((item) => item.parent !== '—').length} categories have a parent`}
          icon={GitBranch}
        />
      </section>

      <div className="category-split grid items-start gap-4">
        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">Category register</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              Showing {filtered.length} of {categories.length} categories · PKR · {shownActive} active ·{' '}
              {shownInactive} inactive
            </p>
          </div>

          <div className="flex flex-col gap-2 px-5 py-3 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search category name or code"
                className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
              />
            </label>
            <div className="inline-flex items-center rounded-lg bg-[#e6edf5] p-0.5 text-sm">
              {[
                ['all', 'All'],
                ['active', 'Active'],
                ['inactive', 'Inactive'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatus(key)}
                  className={`rounded-md px-3 py-1 ${
                    status === key ? 'bg-white font-medium text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              value={parent}
              onChange={(event) => setParent(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              {parents.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <GlobalTable
            ariaLabel="Category register"
            columns={categoryColumns(selectedId, navigate)}
            data={filtered}
            pagination
            rowsPerPage={10}
            className="h-108! max-h-108!"
            contentClassName = 'min-w-[760px]'
            onRowPress={(item) => setSelectedId(item.id)}
            emptyContent={categoriesQuery.isLoading ? 'Loading categories...' : categoriesQuery.isError ? 'Could not load categories.' : 'No categories match these filters.'}
            rowClassName={(item) =>
              item.id === selectedId
                ? 'row-selected cursor-pointer border-b border-slate-100'
                : 'cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50'
            }
          />
        </section>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm">
          {selected ? (
            <CategoryDetails
              category={selected}
              categories={categories}
              children={children}
              onView={() => navigate(`/products/categories/${selected.id}`)}
              onEdit={() => navigate(`/products/categories/${selected.id}/edit`)}
              onToggleStatus={() => {
                const nextStatus = selected.statusValue === 'active' ? 'inactive' : 'active'
                updateCategory.mutate(
                  { id: selected.id, status: nextStatus },
                  {
                    onSuccess: (data) => {
                      toast.success(data?.message || (nextStatus === 'active' ? `${selected.name} activated.` : `${selected.name} deactivated.`))
                    },
                    onError: (error) => {
                      toast.error(error.response?.data?.message || 'Could not update the category status.')
                    },
                  },
                )
              }}
            />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">Select a category to see its details.</p>
          )}
        </aside>
      </div>
    </div>
  )
}

function Metric({ label, value, hint, icon: Icon }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</p>
        <Icon size={16} className="text-slate-400" />
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-[28px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
        <p className="mb-0.5 text-right text-xs text-slate-400">{hint}</p>
      </div>
    </article>
  )
}

function ancestorChain(category, categories) {
  const chain = []
  const seen = new Set()
  let current = category
  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    chain.unshift(current)
    current = current.parentId ? categories.find((item) => item.id === current.parentId) : null
  }
  return chain
}

function productPack(product) {
  const unit =
    product.packingUnitId && typeof product.packingUnitId === 'object'
      ? product.packingUnitId
      : product.quantityUnitId && typeof product.quantityUnitId === 'object'
        ? product.quantityUnitId
        : null
  if (!unit) return ''
  return (unit.name || unit.shortCode || '').toLowerCase()
}

function CategoryDetails({ category, categories, children, onToggleStatus }) {
  const navigate = useNavigate()
  const segments = ancestorChain(category, categories)
  const childRows = [...children].sort((a, b) => a.name.localeCompare(b.name))
  const active = category.status === 'Active'
  const productsQuery = useProducts({ page: 1, limit: 4, search: '', status: '', categoryId: category.id })
  const products = productsQuery.data?.data || []
  const assigned = productsQuery.data?.meta?.total ?? products.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Category details</h2>
       
      </div>

      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf3ff] text-[#2f6fed]">
          <Tag size={15} />
        </span>
        <div>
          <p className="text-base font-semibold text-slate-900">{category.name}</p>
          <p className="font-mono text-[12px] text-slate-400">{category.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Detail label="Display name" value={category.name} />
        <Detail label="Unique code" value={category.code} mono />
      </div>
      <Detail label="Parent category" value={category.parent} />
      <div>
        <dt className="text-[11px] text-slate-400">Status</dt>
        <dd className={`mt-0.5 text-sm font-medium ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
          {category.status}
        </dd>
      </div>

      <div className="rounded-xl bg-slate-50 px-3 py-3">
        <p className="text-[13px] font-semibold text-slate-800">Parent & child context</p>
        <div className="mt-2 flex flex-wrap items-center gap-1 text-[13px]">
          {segments.map((segment, index) => (
            <span key={segment.id} className="inline-flex items-center gap-1">
              {index > 0 && <ChevronRight size={13} className="text-slate-400" />}
              <span className={segment.id === category.id ? 'font-medium text-[#2f6fed]' : 'text-slate-500'}>
                {segment.name}
              </span>
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {childRows.length === 0
            ? 'No child categories.'
            : `${childRows.length} child ${childRows.length === 1 ? 'category' : 'categories'}`}
        </p>
        {childRows.length > 0 && (
          <ul className="mt-2 space-y-2">
            {childRows.map((child) => (
              <li key={child.id} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="inline-block h-3.5 w-3 shrink-0 rounded-bl-[3px] border-b border-l border-slate-300" />
                  <span className="truncate text-sm text-slate-800">{child.name}</span>
                </span>
                <StatusPill status={child.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200/80 px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-semibold text-slate-800">Related products</p>
          <p className="shrink-0 text-[11px] text-slate-400">
            {productsQuery.isLoading ? 'Loading...' : `${assigned} directly assigned`}
          </p>
        </div>
        {products.length > 0 ? (
          <ul className="mt-1 divide-y divide-slate-100">
            {products.map((product) => {
              const pack = productPack(product)
              return (
                <li key={product._id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{product.name}</p>
                    <p className="truncate text-[12px] text-slate-400">
                      {[product.sku, pack].filter(Boolean).join(' · ') || 'No SKU'}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Open ${product.name}`}
                    onClick={() => navigate(`/products/products/${product._id}`)}
                    className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-[#2f6fed]"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          !productsQuery.isLoading && (
            <p className="mt-2 text-sm text-slate-400">No products assigned to this category.</p>
          )
        )}
        <Link
          to={`/products/products?categoryId=${category.id}`}
          aria-disabled={products.length === 0}
          tabIndex={products.length === 0 ? -1 : undefined}
          onClick={(event) => {
            if (products.length === 0) event.preventDefault()
          }}
          className={`mt-2 inline-flex items-center gap-1 text-[13px] font-medium ${
            products.length === 0 ? 'pointer-events-none text-slate-300' : 'text-[#2f6fed]'
          }`}
        >
          View in Products
          <ArrowRight size={14} />
        </Link>
      </div>

      <button
        type="button"
        onClick={onToggleStatus}
        className={`w-full rounded-lg border px-3 py-2 text-sm font-medium ${
          active
            ? 'border-red-200 text-red-600'
            : 'border-emerald-200 text-emerald-600'
        }`}
      >
        {active ? 'Deactivate category' : 'Activate category'}
      </button>

      <div className="rounded-xl bg-[#eaf3ff] px-3 py-3">
        <p className="text-sm font-semibold text-[#2f6fed]">Classification only</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          A parent is optional. Keep the hierarchy free of circular links. Creating a category is not a stock
          inventory movement or accounting transaction.
        </p>
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  const active = status === 'Active'
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {status}
    </span>
  )
}

function Detail({ label, value, mono = false }) {
  return (
    <div>
      <dt className="text-[11px] text-slate-400">{label}</dt>
      <dd className={`mt-0.5 text-sm text-slate-800 ${mono ? 'font-mono text-[12px] text-slate-500' : ''}`}>
        {value}
      </dd>
    </div>
  )
}

export default CategoryPage
