import { useEffect, useMemo, useState } from 'react'
import { Button } from '@heroui/react'
import { ChevronRight, CircleCheck, ClipboardList, Download, GitBranch, Info, Plus, Search, Tag, Trash2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { toast } from 'react-toastify'
import { sidebarMenu } from '../../../components/sidebarMenu.js'
import GlobalTable from '../../../components/GlobalTable.jsx'

function category(code, name, parent, description, status = 'Active', products = [], group = parent || '—') {
  return {
    id: code,
    code,
    name,
    parent: parent || '—',
    group,
    description,
    status,
    products,
  }
}

const categories = [
  category('CAT-FNB', 'Food & Beverage', '', 'Meals, drinks, and grocery classifications', 'Active', [], 'Food & Beverage'),
  category('CAT-BEV', 'Beverages', 'Food & Beverage', 'Coffee, water, and packaged drinks', 'Active', [
    { name: 'Arabica Coffee 1 kg', sku: 'BEV-1042', status: 'Active' },
    { name: 'Sparkling Water 330 ml', sku: 'BEV-1180', status: 'Active' },
  ]),
  category('CAT-COF', 'Coffee', 'Beverages', 'Roasted beans and ground coffee', 'Active', [
    { name: 'Arabica Coffee 1 kg', sku: 'BEV-1042', status: 'Active' },
  ]),
  category('CAT-WAT', 'Water', 'Beverages', 'Still and sparkling water', 'Active', [
    { name: 'Sparkling Water 330 ml', sku: 'BEV-1180', status: 'Active' },
  ]),
  category('CAT-DAI', 'Dairy', 'Food & Beverage', 'Milk, cream, and chilled dairy', 'Active', [
    { name: 'Whole Milk 1 L', sku: 'DAI-0448', status: 'Active' },
  ]),
  category('CAT-MLK', 'Milk', 'Dairy', 'Fresh milk and dairy drinks', 'Active', [
    { name: 'Whole Milk 1 L', sku: 'DAI-0448', status: 'Active' },
  ]),
  category('CAT-YOG', 'Yogurt', 'Dairy', 'Cups, pots, and drinking yogurt'),
  category('CAT-DRY', 'Dry Goods', 'Food & Beverage', 'Rice, flour, and pantry staples'),
  category('CAT-RIC', 'Rice', 'Dry Goods', 'Basmati and other rice grades', 'Active', [
    { name: 'Basmati Rice 25 kg', sku: 'DRY-0081', status: 'Active' },
  ]),
  category('CAT-FLR', 'Flour', 'Dry Goods', 'Wheat and specialty flours'),
  category('CAT-SNK', 'Snacks', 'Food & Beverage', 'Chips, nuts, and ready snacks'),
  category('CAT-CHI', 'Chips', 'Snacks', 'Salted and savory crisps'),
  category('CAT-BIS', 'Biscuits', 'Snacks', 'Sweet biscuits and tea snacks'),
  category('CAT-FRZ', 'Frozen', 'Food & Beverage', 'Frozen prepared food ranges', 'Inactive', [
    { name: 'Frozen Peas 1 kg', sku: 'FZN-0042', status: 'Active' },
  ]),
  category('CAT-VEG', 'Vegetables', 'Frozen', 'Frozen peas and mixed vegetables'),
  category('CAT-SEA', 'Seasonal', 'Food & Beverage', 'Chilled and seasonal fresh ranges', 'Inactive'),
  category('CAT-HOU', 'Household', '', 'Home and household classifications', 'Active', [], 'Household'),
  category('CAT-CLN', 'Cleaning', 'Household', 'Cleaning supplies and chemicals', 'Active', [
    { name: 'Floor Cleaner 5 L', sku: 'CLN-2201', status: 'Active' },
  ]),
  category('CAT-FLC', 'Floor Care', 'Cleaning', 'Floor cleaners and disinfectants'),
  category('CAT-HYG', 'Hygiene', 'Household', 'Soap and personal-care products', 'Active', [
    { name: 'Hand Wash 500 ml', sku: 'HYG-0032', status: 'Active' },
  ]),
  category('CAT-PER', 'Personal Care', 'Hygiene', 'Soap, body wash, and personal hygiene'),
  category('CAT-OPS', 'Operations', '', 'Operating supplies used across branches', 'Active', [], 'Operations'),
  category('CAT-PKG', 'Packaging', 'Operations', 'Bags, wraps, and packaging supplies', 'Active', [
    { name: 'Paper Carry Bag L', sku: 'PKG-3118', status: 'Active' },
  ]),
  category('CAT-BAG', 'Paper Carry Bags', 'Packaging', 'Retail paper and plastic bags', 'Active', [
    { name: 'Paper Carry Bag L', sku: 'PKG-3118', status: 'Active' },
  ]),
  category('CAT-CAN', 'Cartons', 'Packaging', 'Folding cartons and shipping boxes'),
  category('CAT-LAB', 'Labels', 'Packaging', 'Printed labels and shelf tags'),
]

const parents = ['All parents', ...new Set(categories.map((item) => item.parent).filter((parent) => parent !== '—'))]

function categoryColumns(selectedId) {
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
        <span className={`text-[13px] font-medium ${item.id === selectedId ? 'text-[#2f6fed]' : 'text-slate-800'}`}>
          {item.name}
        </span>
      ),
    },
    {
      key: 'parent',
      label: 'Parent category',
      renderCell: (item) => <span className="text-[13px] text-slate-500">{item.parent}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      renderCell: (item) => <span className="text-[13px] text-slate-500">{item.description}</span>,
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
  ]
}
const tabs = sidebarMenu.find((item) => item.key === 'products')?.children || []

function CategoryPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [parent, setParent] = useState('All parents')
  const [selectedId, setSelectedId] = useState('CAT-BEV')

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
  }, [query, status, parent])

  useEffect(() => {
    if (!filtered.some((category) => category.id === selectedId)) {
      setSelectedId(filtered[0]?.id || '')
    }
  }, [filtered, selectedId])

  const selected = categories.find((category) => category.id === selectedId)
  const children = selected
    ? categories.filter((item) => item.parent === selected.name)
    : []
  const shownActive = filtered.filter((item) => item.status === 'Active').length
  const shownInactive = filtered.length - shownActive

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Products & Inventory (PKR)
          </p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">
            Categories
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Maintain product classifications, parent categories, and active status across branches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onPress={() => toast.success('Category register exported.')}>
            <Download size={15} />
            Export
          </Button>
          <Button size="sm" onPress={() => toast.success('Add category opened.')}>
            <Plus size={15} />
            Add Category
          </Button>
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
                isActive
                  ? 'bg-white font-medium text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total categories" value="26" hint="Complete register" icon={ClipboardList} />
        <Metric label="Active" value="24" hint="Available for classification" icon={CircleCheck} />
        <Metric label="Inactive" value="2" hint="Historical references retained" icon={Trash2} />
        <Metric label="Top-level categories" value="3" hint="23 categories have a parent" icon={GitBranch} />
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
            columns={categoryColumns(selectedId)}
            data={filtered}
            pagination
            rowsPerPage={10}
            className="h-108! max-h-108!"
            onRowPress={(item) => setSelectedId(item.id)}
            emptyContent="No categories match these filters."
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
              children={children}
              onEdit={() => toast.success(`${selected.name} edit opened.`)}
              onToggleStatus={() =>
                toast.success(
                  selected.status === 'Active'
                    ? `${selected.name} deactivated.`
                    : `${selected.name} activated.`,
                )
              }
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

function CategoryDetails({ category, children, onEdit, onToggleStatus }) {
  const segments = category.parent === '—' ? [category.name] : [category.parent, category.name]
  const active = category.status === 'Active'
  const productCount = category.products.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Category details</h2>
        <button type="button" onClick={onEdit} className="text-sm font-medium text-slate-600">
          Edit category
        </button>
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
      <Detail label="Description" value={category.description} />
      <div>
        <dt className="text-[11px] text-slate-400">Status</dt>
        <dd className={`mt-0.5 text-sm font-medium ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
          {category.status}
        </dd>
      </div>

      <div className="rounded-xl bg-slate-50 px-3 py-3">
        <p className="text-xs font-semibold text-slate-700">Parent & child context</p>
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {segments.map((segment, index) => (
            <span key={segment} className="inline-flex items-center gap-1">
              {index > 0 && <ChevronRight size={12} className="text-slate-400" />}
              <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
                {segment}
              </span>
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          {children.length === 0
            ? 'No child categories.'
            : `${children.length} child ${children.length === 1 ? 'category' : 'categories'}`}
        </p>
        {children.length > 0 && (
          <ul className="mt-1">
            {children.map((child) => (
              <li key={child.id} className="flex items-center justify-between gap-3 py-1">
                <span className="text-sm text-slate-700">{child.name}</span>
                <StatusPill status={child.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-slate-700">Related products</p>
          <p className="text-[11px] text-slate-400">{productCount} directly assigned</p>
        </div>
        {productCount > 0 ? (
          <ul className="mt-1">
            {category.products.map((product) => (
              <li key={product.sku} className="py-1.5">
                <p className="text-sm font-medium text-slate-800">{product.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="font-mono">{product.sku}</span>
                  <span>·</span>
                  <span className={`inline-flex items-center gap-1 ${product.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span
                      className={`rounded-full ${product.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      style={{ width: 6, height: 6 }}
                    />
                    {product.status === 'Active' ? 'Live' : product.status}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-400">No products linked yet.</p>
        )}
      </div>

      {productCount > 0 && (
        <div className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500">
          <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />
          <p>
            This category is referenced by products. Deactivate it instead of deleting it to preserve product
            history.
          </p>
        </div>
      )}

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
