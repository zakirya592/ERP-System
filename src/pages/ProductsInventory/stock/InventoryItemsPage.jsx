import { useEffect, useMemo, useState } from 'react'
import { ArrowRightLeft, ChevronDown, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import ExportButton from '../../../components/ExportButton.jsx'
import GlobalTable from '../../../components/GlobalTable.jsx'
import InventoryTabs from '../InventoryTabs.jsx'
import {
  daysUntilExpiry,
  expiryOptions,
  expiryRisk,
  formatExpiry,
  formatPkr,
  inventoryItems,
  inventorySummary,
  lineValue,
  mostUrgentExpiry,
  stateClass,
  stateLabel,
  stateOptions,
  stateTabs,
  warehouseOptions,
} from './inventoryItemRecords.js'

const limit = 8

function InventoryItemsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [warehouse, setWarehouse] = useState('Main WH')
  const [stateFilter, setStateFilter] = useState('')
  const [expiryFilter, setExpiryFilter] = useState('')
  const [stateTab, setStateTab] = useState('all')
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(query.trim().toLowerCase()), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, warehouse, stateFilter, expiryFilter, stateTab])

  const filtered = useMemo(() => {
    return inventoryItems.filter((item) => {
      if (warehouse && item.warehouse !== warehouse) return false
      if (stateTab !== 'all' && item.state !== stateTab) return false
      if (stateFilter && item.state !== stateFilter) return false
      if (expiryFilter === 'soon') {
        const days = daysUntilExpiry(item.expiry)
        if (days === null || days > 30 || days < 0) return false
      } else if (expiryFilter === '90') {
        const days = daysUntilExpiry(item.expiry)
        if (days === null || days > 90 || days < 0) return false
      } else if (expiryFilter === 'none' && item.expiry) {
        return false
      }
      if (!debouncedSearch) return true
      const haystack = `${item.sku} ${item.product} ${item.batch} ${item.serial}`.toLowerCase()
      return haystack.includes(debouncedSearch)
    })
  }, [debouncedSearch, warehouse, stateFilter, expiryFilter, stateTab])

  const tabCounts = useMemo(() => {
    const base = inventoryItems.filter((item) => !warehouse || item.warehouse === warehouse)
    return {
      all: base.length,
      available: base.filter((item) => item.state === 'available').length,
      hold: base.filter((item) => item.state === 'hold').length,
      damaged: base.filter((item) => item.state === 'damaged').length,
    }
  }, [warehouse])

  const total = filtered.length
  const pageRows = filtered.slice((page - 1) * limit, page * limit)
  const selected = filtered.find((item) => item.id === selectedId) || pageRows[0] || null
  const urgent = mostUrgentExpiry(filtered)
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, total)
  const tableSummary =
    total <= limit
      ? `Showing all ${total} ${total === 1 ? 'batch' : 'batches'}`
      : `Showing ${rangeStart} to ${rangeEnd} of ${total} batches`

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId('')
      return
    }
    const visible = filtered.slice((page - 1) * limit, page * limit)
    if (!visible.some((item) => item.id === selectedId)) {
      setSelectedId(visible[0]?.id || '')
    }
  }, [filtered, page, selectedId])

  const columns = [
    {
      key: 'product',
      label: 'Product',
      isRowHeader: true,
      exportValue: (item) => `${item.sku} ${item.product}`,
      renderCell: (item) => (
        <div>
          <p className="font-mono text-[12px] text-slate-400">{item.sku}</p>
          <p className="text-[13px] font-medium text-slate-800">{item.product}</p>
        </div>
      ),
    },
    {
      key: 'warehouse',
      label: 'Warehouse',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{item.warehouse}</span>,
    },
    {
      key: 'batch',
      label: 'Batch',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-600">{item.batch}</span>,
    },
    {
      key: 'serial',
      label: 'Serial',
      exportValue: (item) => item.serial || '',
      renderCell: (item) => (
        <span className="font-mono text-[12px] text-slate-400">{item.serial || '—'}</span>
      ),
    },
    {
      key: 'expiry',
      label: 'Expiry',
      exportValue: (item) => formatExpiry(item.expiry),
      renderCell: (item) => <span className="text-[13px] text-slate-600">{formatExpiry(item.expiry)}</span>,
    },
    {
      key: 'quantity',
      label: 'Quantity',
      exportValue: (item) => `${item.quantity} ${item.unit}`,
      renderCell: (item) => (
        <span className="text-[13px] font-medium text-slate-800">
          {item.quantity.toLocaleString('en-US')} {item.unit}
        </span>
      ),
    },
    {
      key: 'unitCost',
      label: 'Unit cost (PKR)',
      className: 'text-right uppercase tracking-wide',
      cellClassName: 'text-right',
      exportValue: (item) => item.unitCost,
      renderCell: (item) => (
        <span className="text-[13px] text-slate-700">
          {Number(item.unitCost).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: 'state',
      label: 'State',
      exportValue: (item) => stateLabel[item.state] || item.state,
      renderCell: (item) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
            stateClass[item.state] || 'bg-slate-100 text-slate-500'
          }`}
        >
          {stateLabel[item.state] || item.state}
        </span>
      ),
    },
    {
      key: 'expiryRisk',
      label: 'Expiry risk',
      exportValue: (item) => {
        const risk = expiryRisk(item)
        return risk.tone === 'warning' ? risk.label : risk.days != null ? `${risk.days} days` : risk.label
      },
      renderCell: (item) => {
        const risk = expiryRisk(item)
        if (risk.tone === 'warning') {
          return (
            <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[12px] font-medium text-amber-700">
              {risk.label}
            </span>
          )
        }
        if (risk.tone === 'danger') {
          return <span className="text-[12px] font-medium text-rose-600">{risk.label}</span>
        }
        return <span className="text-[12px] text-slate-400">{risk.label}</span>
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#2f6fed] uppercase">
            Products & Inventory / Stock
          </p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">
            Inventory Items
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Inspect warehouse stock by batch, serial, expiry, and availability state. All monetary values are shown in
            PKR.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/products/movements')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            <ArrowRightLeft size={15} />
            Stock Movements
          </button>
          <ExportButton
            filename="inventory-items"
            sheetName="Inventory Items"
            label="Export"
            columns={columns}
            rows={filtered}
          />
        </div>
      </div>

      <InventoryTabs />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Inventory value"
          value={formatPkr(inventorySummary.inventoryValue, { compact: true })}
          action={
            <button type="button" className="cursor-pointer text-xs font-medium text-[#2f6fed]">
              View print
            </button>
          }
        />
        <Metric
          label="Active batches"
          value={inventorySummary.activeBatches.toLocaleString('en-US')}
          action={
            <button
              type="button"
              onClick={() => {
                setStateTab('all')
                setStateFilter('')
              }}
              className="cursor-pointer text-xs font-medium text-[#2f6fed]"
            >
              View batches
            </button>
          }
        />
        <Metric
          label="Substitutable batches"
          value={String(inventorySummary.substitutableBatches)}
          action={
            <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              {inventorySummary.substitutableShare}% total
            </span>
          }
        />
        <Metric
          label="Out of stock / damaged"
          value={`${inventorySummary.outOfStock} / ${inventorySummary.damaged}`}
          action={
            <span className="inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600">
              Action required
            </span>
          }
        />
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Inventory item register</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Search by product, batch, or serial. Filter by warehouse, state, and expiry window.
          </p>
        </div>

        <div className="flex flex-col gap-2 px-5 py-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search product, batch, serial"
              className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <FilterSelect value={warehouse} onChange={setWarehouse} ariaLabel="Warehouse" options={warehouseOptions} />
          <FilterSelect value={stateFilter} onChange={setStateFilter} ariaLabel="State" options={stateOptions} />
          <FilterSelect
            value={expiryFilter}
            onChange={setExpiryFilter}
            ariaLabel="Expiry"
            options={expiryOptions}
          />
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 pb-3">
          {stateTabs.map((tab) => {
            const selectedTab = stateTab === tab.key
            const count = tabCounts[tab.key] ?? 0
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStateTab(tab.key)
                  setStateFilter('')
                }}
                className={
                  selectedTab
                    ? 'cursor-pointer rounded-full bg-[#e8f1ff] px-3 py-1.5 text-sm font-medium text-[#2f6fed]'
                    : 'cursor-pointer rounded-full bg-slate-50 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100'
                }
              >
                {tab.label} ({count})
              </button>
            )
          })}
        </div>

        <GlobalTable
          ariaLabel="Inventory item register"
          columns={columns}
          data={pageRows}
          pagination
          rowsPerPage={limit}
          page={page}
          totalCount={total}
          onPageChange={setPage}
          summary={tableSummary}
          contentClassName="min-w-[1100px]"
          onRowPress={(item) => setSelectedId(item.id)}
          emptyContent="No inventory items match these filters."
          rowClassName={(item) =>
            item.id === selected?.id
              ? 'row-selected cursor-pointer border-b border-slate-100'
              : 'cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50'
          }
        />
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Expiry attention</h2>
          {urgent ? (
            <>
              <p className="mt-1 text-sm text-slate-500">
                {urgent.product} · {urgent.batch}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                    Expires / remaining
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                    {formatExpiry(urgent.expiry)} · {urgent.days} days
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                    Quantity / value
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                    {urgent.quantity.toLocaleString('en-US')} {urgent.unit} · {formatPkr(lineValue(urgent))}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No batches need expiry attention under the current filters.</p>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Availability and movement trace</h2>
          {selected ? (
            <>
              <p className="mt-1 text-sm text-slate-500">
                {selected.sku} · {selected.batch} · {stateLabel[selected.state]}
              </p>
              <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
                Stock availability is derived from posted movements. Purchases, sales, transfers, adjustments, and
                damage reports update on-hand quantity for this batch. Reserved and hold quantities stay unavailable
                until released.
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/products/movements" className="text-sm font-medium text-[#2f6fed]">
                  Open stock movements
                </Link>
                <button
                  type="button"
                  onClick={() => navigate('/products/transfers')}
                  className="cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Create transfer
                </button>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Select a batch to see how availability is tracked.</p>
          )}
        </article>
      </section>
    </div>
  )
}

function Metric({ label, value, action }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</p>
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
      <div className="mt-3 flex min-h-5 items-center justify-end">{action}</div>
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
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
    </label>
  )
}

export default InventoryItemsPage
