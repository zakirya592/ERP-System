import { useMemo, useState } from 'react'
import { Button } from '@heroui/react'
import { Clock, Download, LayoutGrid, Plus, Search, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import GlobalTable from '../../components/GlobalTable.jsx'

const rowsPerPage = 8

const seed = [
  sale('SL-09184', 'Sep 30, 14:28', 30, 'Northline Retail', 'Central Branch', 'Main Warehouse', 4280, 4280, 0, 'Posted'),
  sale('SL-09183', 'Sep 30, 13:42', 30, 'Coastal Café Group', 'Central Branch', 'Main Warehouse', 8640, 5000, 3640, 'Approved'),
  sale('SL-09182', 'Sep 30, 12:16', 30, 'Walk-in customer', 'Airport Shop', 'Shop Store', 388, 388, 0, 'Posted'),
  sale('SL-09181', 'Sep 30, 11:40', 30, 'Oasis Hospitality', 'Central Branch', 'Main Warehouse', 12680, 0, 12680, 'Approved'),
  sale('SL-09180', 'Sep 30, 10:24', 30, 'Vertex Offices', 'East Branch', 'East Depot', 2140, 1000, 1140, 'Draft'),
  sale('SL-09179', 'Sep 29, 17:18', 29, 'Market Lane Foods', 'Central Branch', 'Main Warehouse', 8820, 8820, 0, 'Posted'),
  sale('SL-09178', 'Sep 28, 15:52', 28, 'Harbor Kitchens', 'North Branch', 'North Warehouse', 3760, 2500, 1260, 'Part paid'),
  sale('SL-09177', 'Sep 29, 15:35', 29, 'Cedar & Co.', 'Central Branch', 'Main Warehouse', 1980, 0, 1980, 'Cancelled'),
]

const customers = [
  'Northline Retail',
  'Coastal Café Group',
  'Walk-in customer',
  'Oasis Hospitality',
  'Vertex Offices',
  'Market Lane Foods',
  'Harbor Kitchens',
  'Cedar & Co.',
]
const locations = [
  ['Central Branch', 'Main Warehouse'],
  ['Airport Shop', 'Shop Store'],
  ['East Branch', 'East Depot'],
  ['North Branch', 'North Warehouse'],
]
const statuses = ['Posted', 'Approved', 'Draft', 'Part paid', 'Cancelled']

const sales = [
  ...seed,
  ...Array.from({ length: 1276 }, (_, index) => {
    const number = 9176 - index
    const day = 27 - (index % 27)
    const hour = 9 + (index % 10)
    const minute = (index * 7) % 60
    const [branch, warehouse] = locations[index % locations.length]
    const status = statuses[index % statuses.length]
    const total = 480 + ((index * 137) % 14000)
    const paid = status === 'Posted' ? total : status === 'Draft' || status === 'Cancelled' ? 0 : Math.round(total * 0.45)
    return sale(
      `SL-${String(number).padStart(5, '0')}`,
      `Sep ${day}, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      day,
      customers[index % customers.length],
      branch,
      warehouse,
      total,
      paid,
      total - paid,
      status,
    )
  }),
]

const statusOptions = ['All statuses', ...statuses]
const branchOptions = ['All branches', ...new Set(sales.map((item) => item.branch))]
const warehouseOptions = ['All warehouses', ...new Set(sales.map((item) => item.warehouse))]
const rangeOptions = ['Sep 01 – Sep 30', 'Sep 01 – Sep 15', 'Sep 16 – Sep 30']

const statusClass = {
  Posted: 'bg-emerald-50 text-emerald-600',
  Approved: 'bg-blue-50 text-blue-600',
  Draft: 'bg-slate-100 text-slate-500',
  'Part paid': 'bg-amber-50 text-amber-600',
  Cancelled: 'bg-rose-50 text-rose-500',
}

function sale(id, date, day, customer, branch, warehouse, total, paid, receivable, status) {
  return { id, date, day, customer, branch, warehouse, total, paid, receivable, status }
}

function money(value) {
  return value.toLocaleString('en-US')
}

const columns = [
  {
    key: 'id',
    label: 'DOCUMENT',
    renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.id}</span>,
  },
  {
    key: 'date',
    label: 'DATE',
    renderCell: (item) => <span className="text-[13px] text-slate-500">{item.date}</span>,
  },
  {
    key: 'customer',
    label: 'CUSTOMER',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.customer}</span>,
  },
  {
    key: 'branch',
    label: 'BRANCH',
    renderCell: (item) => <span className="text-[13px] text-slate-500">{item.branch}</span>,
  },
  {
    key: 'warehouse',
    label: 'WAREHOUSE',
    renderCell: (item) => <span className="text-[13px] text-slate-500">{item.warehouse}</span>,
  },
  {
    key: 'total',
    label: 'TOTAL (PKR)',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="text-[13px] text-slate-700">{money(item.total)}</span>,
  },
  {
    key: 'paid',
    label: 'PAID (PKR)',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="text-[13px] text-slate-700">{money(item.paid)}</span>,
  },
  {
    key: 'receivable',
    label: 'RECEIVABLE',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="text-[13px] text-slate-700">{money(item.receivable)}</span>,
  },
  {
    key: 'status',
    label: 'STATUS',
    renderCell: (item) => (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClass[item.status]}`}>
        {item.status}
      </span>
    ),
  },
]

function SalesPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [range, setRange] = useState('Sep 01 – Sep 30')
  const [status, setStatus] = useState('All statuses')
  const [branch, setBranch] = useState('All branches')
  const [warehouse, setWarehouse] = useState('All warehouses')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return sales.filter((item) => {
      const matchesQuery =
        !needle || item.id.toLowerCase().includes(needle) || item.customer.toLowerCase().includes(needle)
      const matchesRange =
        range === 'Sep 01 – Sep 30' ||
        (range === 'Sep 01 – Sep 15' && item.day <= 15) ||
        (range === 'Sep 16 – Sep 30' && item.day >= 16)
      const matchesStatus = status === 'All statuses' || item.status === status
      const matchesBranch = branch === 'All branches' || item.branch === branch
      const matchesWarehouse = warehouse === 'All warehouses' || item.warehouse === warehouse
      return matchesQuery && matchesRange && matchesStatus && matchesBranch && matchesWarehouse
    })
  }, [query, range, status, branch, warehouse])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Sales</p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Sales</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Create, approve, post, and collect sales documents with clear warehouse and receivable impact.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onPress={() => toast.success('Sales register exported.')}>
            <Download size={15} />
            Export
          </Button>
          <Button size="sm" onPress={() => navigate('/sales/sales/new')}>
            <Plus size={15} />
            New Sale
          </Button>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Net sales"
          value="PKR 428,680"
          hint="+12.4%"
          hintClassName="text-emerald-500"
          icon={TrendingUp}
          iconClassName="text-emerald-500"
          hintIcon={TrendingUp}
        />
        <StatCard
          label="Posted today"
          value="PKR 46,812"
          hint="28 documents"
          hintClassName="text-slate-400"
          icon={Clock}
          iconClassName="text-slate-400"
        />
        <StatCard
          label="Receivable"
          value="PKR 96,240"
          hint="18 overdue"
          hintClassName="text-orange-500"
          icon={Clock}
          iconClassName="text-orange-400"
        />
        <StatCard
          label="Average order"
          value="PKR 1,842"
          hint="+6.1%"
          hintClassName="text-emerald-500"
          icon={LayoutGrid}
          iconClassName="text-sky-500"
        />
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Sales register</h2>
            <p className="mt-0.5 text-sm text-slate-400">All customer sales documents</p>
          </div>
          <p className="text-sm text-slate-400">Last synced 2 min ago</p>
        </div>

        <div className="flex flex-col gap-2 px-5 py-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search document or customer"
              className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <FilterSelect value={range} onChange={setRange} options={rangeOptions} />
          <FilterSelect value={status} onChange={setStatus} options={statusOptions} />
          <FilterSelect value={branch} onChange={setBranch} options={branchOptions} />
          <FilterSelect value={warehouse} onChange={setWarehouse} options={warehouseOptions} />
        </div>

        <GlobalTable
          ariaLabel="Sales register"
          columns={columns}
          data={filtered}
          pagination
          rowsPerPage={rowsPerPage}
          className="h-auto! max-h-none!"
          emptyContent="No sales match these filters."
          rowClassName="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
        />
      </section>
    </div>
  )
}

function StatCard({ label, value, hint, hintClassName, icon: Icon, iconClassName, hintIcon: HintIcon }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</p>
        <Icon size={16} className={iconClassName} />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-[26px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
        <p className={`mb-0.5 inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap ${hintClassName}`}>
          {HintIcon ? <HintIcon size={12} /> : null}
          {hint}
        </p>
      </div>
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

export default SalesPage
