import { useMemo, useState } from 'react'
import { Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { Boxes, CircleDollarSign, Download, Plus, Search, SlidersHorizontal, Trash2, TriangleAlert, Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import GlobalTable from '../../../components/GlobalTable.jsx'

const catalogTotal = 3846
const rowsPerPage = 10

const sample = [
  { sku: 'BEV-1042', name: 'Arabica Coffee 1 kg', category: 'Beverages', unit: 'bag', cost: 12.4, sale: 18.9, available: 18, reserved: 2, state: 'Critical' },
  { sku: 'DRY-0081', name: 'Basmati Rice 25 kg', category: 'Dry Goods', unit: 'bag', cost: 22.1, sale: 31.5, available: 6, reserved: 0, state: 'Low' },
  { sku: 'CLN-2201', name: 'Floor Cleaner 5 L', category: 'Cleaning', unit: 'can', cost: 4.8, sale: 8.2, available: 15, reserved: 2, state: 'Critical' },
  { sku: 'PKG-3118', name: 'Paper Carry Bag L', category: 'Packaging', unit: 'pcs', cost: 0.18, sale: 0.45, available: 120, reserved: 0, state: 'Low' },
  { sku: 'DAI-0448', name: 'Whole Milk 1 L', category: 'Dairy', unit: 'ctn', cost: 0.95, sale: 1.4, available: 8, reserved: 2, state: 'Low' },
  { sku: 'GRN-1103', name: 'Sea Salt Coarse', category: 'Groceries', unit: 'box', cost: 6.2, sale: 9.5, available: 24, reserved: 0, state: 'Healthy' },
  { sku: 'BEV-1180', name: 'Sparkling Water 330 ml', category: 'Beverages', unit: 'case', cost: 8.4, sale: 14, available: 36, reserved: 6, state: 'Healthy' },
  { sku: 'HYG-0032', name: 'Hand Wash 500 ml', category: 'Hygiene', unit: 'pcs', cost: 1.1, sale: 2.4, available: 0, reserved: 0, state: 'Out of stock' },
  { sku: 'FZN-0042', name: 'Frozen Peas 1 kg', category: 'Frozen', unit: 'pcs', cost: 1.85, sale: 3.2, available: 14, reserved: 1, state: 'Healthy' },
]

const products = [
  ...sample,
  ...Array.from({ length: 20 }, (_, index) => {
    const base = sample[index % sample.length]
    const sku = `${base.sku.slice(0, 4)}${1100 + index}`
    return { ...base, sku, id: sku }
  }),
].map((product) => ({ ...product, id: product.sku }))

const categories = ['All categories', ...new Set(products.map((product) => product.category))]
const statuses = ['All statuses', 'Critical', 'Low', 'Healthy', 'Out of stock']
const warehouses = ['Main Warehouse', 'North Warehouse', 'Central Warehouse']

const stateClass = {
  Critical: 'text-rose-500',
  Low: 'text-amber-500',
  Healthy: 'text-emerald-500',
  'Out of stock': 'text-rose-500',
}

function money(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const columns = [
  {
    key: 'sku',
    label: 'SKU',
    renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.sku}</span>,
  },
  {
    key: 'name',
    label: 'Product',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.name}</span>,
  },
  {
    key: 'category',
    label: 'Category',
    renderCell: (item) => <span className="text-[13px] text-slate-500">{item.category}</span>,
  },
  {
    key: 'unit',
    label: 'Unit',
    renderCell: (item) => <span className="text-[13px] text-slate-500">{item.unit}</span>,
  },
  {
    key: 'cost',
    label: 'Cost',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="text-[13px] text-slate-700">{money(item.cost)}</span>,
  },
  {
    key: 'sale',
    label: 'Sale',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="text-[13px] text-slate-700">{money(item.sale)}</span>,
  },
  {
    key: 'available',
    label: 'Available',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="text-[13px] text-slate-700">{item.available}</span>,
  },
  {
    key: 'reserved',
    label: 'Reserved',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="text-[13px] text-slate-700">{item.reserved}</span>,
  },
  {
    key: 'state',
    label: 'Reorder state',
    renderCell: (item) => (
      <span className={`text-[13px] font-medium ${stateClass[item.state]}`}>{item.state}</span>
    ),
  },
]

function ProductPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All categories')
  const [status, setStatus] = useState('All statuses')
  const [warehouse, setWarehouse] = useState('Main Warehouse')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter((product) => {
      const matchesQuery =
        !needle ||
        product.name.toLowerCase().includes(needle) ||
        product.sku.toLowerCase().includes(needle)
      const matchesCategory = category === 'All categories' || product.category === category
      const matchesStatus = status === 'All statuses' || product.state === status
      return matchesQuery && matchesCategory && matchesStatus
    })
  }, [query, category, status])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Products & Inventory (PKR)
          </p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage product identity, pricing, and stock availability across operating locations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onPress={() => toast.success('Import opened.')}>
            <Upload size={15} />
            Import
          </Button>
          <Button variant="outline" size="sm" onPress={() => toast.success('Product catalog exported.')}>
            <Download size={15} />
            Export
          </Button>
          <Button size="sm" onPress={() => navigate('/products/products/new')}>
            <Plus size={15} />
            Add Product
          </Button>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active products"
          value="3,846"
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
          value="61"
          hint="review needed"
          hintClassName="text-slate-400"
          icon={Trash2}
          iconClass="text-slate-400"
        />
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Product catalog</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {catalogTotal.toLocaleString('en-US')} products · stock shown for {warehouse} (PKR)
            </p>
          </div>
          <p className="text-sm text-slate-400">Updated 2 min ago</p>
        </div>

        <div className="flex flex-col gap-2 px-5 py-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, SKU, or barcode"
              className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <FilterSelect value={category} onChange={setCategory} options={categories} />
          <FilterSelect value={status} onChange={setStatus} options={statuses} />
          <FilterSelect value={warehouse} onChange={setWarehouse} options={warehouses} />
          <button
            type="button"
            onClick={() => toast.success('More filters opened.')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <SlidersHorizontal size={15} />
            More filters
          </button>
        </div>

        <GlobalTable
          ariaLabel="Product catalog"
          columns={columns}
          data={filtered}
          pagination
          rowsPerPage={rowsPerPage}
          // className="!h-auto !max-h-none"
          emptyContent="No products match these filters."
          rowClassName="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
        />
      </section>
    </div>
  )
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

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  )
}

export default ProductPage
