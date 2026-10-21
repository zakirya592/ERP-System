import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ExportButton from '../../../components/ExportButton.jsx'
import GlobalTable from '../../../components/GlobalTable.jsx'
import InventoryTabs from '../InventoryTabs.jsx'
import { formatPkr, formatPosted, movementTypes, movements, todayInput } from './movementRecords.js'

const typeClass = {
  Purchase: 'text-emerald-600',
  Sale: 'text-sky-600',
  Transfer: 'text-amber-600',
  Adjustment: 'text-violet-600',
}

function movementColumns(selectedId) {
  return [
    {
      key: 'postedAt',
      label: 'Movement date',
      className: 'uppercase tracking-wide',
      exportValue: (item) => formatPosted(item.postedAt),
      renderCell: (item) => (
        <span className={`text-[13px] whitespace-nowrap ${item.id === selectedId ? 'font-medium text-[#2f6fed]' : 'text-slate-500'}`}>
          {formatPosted(item.postedAt)}
        </span>
      ),
    },
    {
      key: 'reference',
      label: 'Reference',
      className: 'uppercase tracking-wide',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-500">{item.reference}</span>,
    },
    {
      key: 'product',
      label: 'Product',
      className: 'uppercase tracking-wide',
      isRowHeader: true,
      renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.product}</span>,
    },
    {
      key: 'location',
      label: 'Location',
      className: 'uppercase tracking-wide',
      renderCell: (item) => <span className="text-[13px] text-slate-500">{item.location}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      className: 'uppercase tracking-wide',
      renderCell: (item) => (
        <span className={`text-[13px] font-medium ${typeClass[item.type] || 'text-slate-500'}`}>{item.type}</span>
      ),
    },
    {
      key: 'qty',
      label: 'Qty',
      className: 'text-right uppercase tracking-wide',
      cellClassName: 'text-right',
      renderCell: (item) => (
        <span className={`text-[13px] font-medium ${item.qty < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
          {item.qty > 0 ? `+${item.qty}` : item.qty}
        </span>
      ),
    },
    {
      key: 'unit',
      label: 'Unit',
      className: 'uppercase tracking-wide',
      renderCell: (item) => <span className="text-[13px] text-slate-500">{item.unit}</span>,
    },
    {
      key: 'value',
      label: 'Value (PKR)',
      className: 'text-right uppercase tracking-wide',
      cellClassName: 'text-right',
      renderCell: (item) => <span className="text-[13px] text-slate-700">{formatPkr(item.value)}</span>,
    },
    {
      key: 'user',
      label: 'User',
      className: 'uppercase tracking-wide',
      renderCell: (item) => <span className="text-[13px] text-slate-500">{item.user}</span>,
    },
  ]
}

function StockMovementsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [branch, setBranch] = useState('Central Branch')
  const [warehouse, setWarehouse] = useState('All warehouses')
  const [type, setType] = useState('All movement types')
  const [date, setDate] = useState(todayInput())
  const [selectedId, setSelectedId] = useState(movements[0].id)

  const branches = useMemo(
    () => ['All branches', ...new Set(movements.map((item) => item.branch))],
    [],
  )
  const warehouses = useMemo(
    () => ['All warehouses', ...new Set(movements.map((item) => item.location))],
    [],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return movements.filter((item) => {
      const matchesQuery =
        !needle ||
        item.product.toLowerCase().includes(needle) ||
        item.reference.toLowerCase().includes(needle) ||
        item.user.toLowerCase().includes(needle)
      const matchesBranch = branch === 'All branches' || item.branch === branch
      const matchesWarehouse = warehouse === 'All warehouses' || item.location === warehouse
      const matchesType = type === 'All movement types' || item.type === type
      const matchesDate = !date || item.date === date
      return matchesQuery && matchesBranch && matchesWarehouse && matchesType && matchesDate
    })
  }, [query, branch, warehouse, type, date])

  useEffect(() => {
    if (!filtered.some((item) => item.id === selectedId)) {
      setSelectedId(filtered[0]?.id || '')
    }
  }, [filtered, selectedId])

  const selected = movements.find((item) => item.id === selectedId) || null
  const quantityIn = filtered.filter((item) => item.qty > 0).reduce((sum, item) => sum + item.qty, 0)
  const quantityOut = filtered.filter((item) => item.qty < 0).reduce((sum, item) => sum + Math.abs(item.qty), 0)
  const net = quantityIn - quantityOut
  const columns = movementColumns(selectedId)

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
            <span className="font-medium text-slate-400">Stock Movements</span>
          </nav>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Stock Movements</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Track every inventory movement posted from purchases, sales, transfers, and adjustments. All quantities and values are saved in PKR.
          </p>
        </div>
        <ExportButton
          filename="stock-movements"
          sheetName="Stock Movements"
          label="Export Movements"
          columns={columns}
          rows={filtered}
        />
      </div>

      <InventoryTabs />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={date === todayInput() ? 'Movements today' : 'Movements'}
          value={String(filtered.length)}
          hint="posted in PKR"
        />
        <Metric label="Quantity in" value={quantityIn.toLocaleString('en-US')} hint="from purchases" />
        <Metric label="Quantity out" value={quantityOut.toLocaleString('en-US')} hint="from sales" />
        <Metric
          label="Net movement"
          value={`${net > 0 ? '+' : ''}${net.toLocaleString('en-US')}`}
          hint="in minus out"
          valueClassName={net < 0 ? 'text-rose-500' : 'text-emerald-600'}
        />
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Movement register</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Search by product or document. Filter by branch, warehouse, type, and date. Values are shown in PKR.
          </p>
        </div>

        <div className="flex flex-col gap-2 px-5 py-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search product or document"
              className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <FilterSelect value={branch} onChange={setBranch} ariaLabel="Branch" options={branches} />
          <FilterSelect value={warehouse} onChange={setWarehouse} ariaLabel="Warehouse" options={warehouses} />
          <FilterSelect value={type} onChange={setType} ariaLabel="Movement type" options={['All movement types', ...movementTypes]} />
          <input
            type="date"
            aria-label="Movement date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          />
        </div>

        <GlobalTable
          ariaLabel="Movement register"
          columns={columns}
          data={filtered}
          pagination
          rowsPerPage={8}
          className="h-auto! max-h-none!"
          contentClassName="min-w-[980px]"
          onRowPress={(item) => setSelectedId(item.id)}
          emptyContent="No movements match these filters."
          rowClassName={(item) =>
            item.id === selectedId
              ? 'row-selected cursor-pointer border-b border-slate-100'
              : 'cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50'
          }
        />
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Source trace</h2>
          {selected ? (
            <>
              <p className="mt-1 text-sm text-slate-500">Posted by {selected.user}</p>
              <dl className="mt-4 space-y-3 text-sm">
                <Trace label="Branch" value={selected.branch} />
                <Trace label="Warehouse" value={selected.location} />
                <Trace label="Document" value={selected.reference} mono />
                <Trace label="Posted" value={formatPosted(selected.postedAt)} />
              </dl>
              <button
                type="button"
                onClick={() => toast.info(`${selected.reference} is the source document for this movement.`)}
                className="mt-4 cursor-pointer text-sm font-medium text-[#2f6fed]"
              >
                Open source document
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Select a movement to see where it was posted.</p>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Movement-based inventory</h2>
          <p className="mt-1 text-sm font-medium text-slate-700">Stock is not edited directly</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Every purchase, sale, transfer, and adjustment posts a movement. The quantity on hand is the sum of those movements.
          </p>
          <button
            type="button"
            onClick={() => navigate('/products/stock')}
            className="mt-4 cursor-pointer text-sm font-medium text-[#2f6fed]"
          >
            Open stock summary
          </button>
        </article>
      </section>
    </div>
  )
}

function Metric({ label, value, hint, valueClassName = 'text-slate-900' }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</p>
      <p className={`mt-3 text-[28px] leading-none font-semibold tracking-tight ${valueClassName}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
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
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-9 pl-3 text-sm text-slate-700 outline-none focus:border-sky-400 lg:w-44"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
    </label>
  )
}

function Trace({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className={`font-medium text-slate-800 ${mono ? 'font-mono text-[13px]' : ''}`}>{value}</dd>
    </div>
  )
}

export default StockMovementsPage
