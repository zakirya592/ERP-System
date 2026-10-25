import { useEffect, useState } from 'react'
import { ArrowRightLeft, ChevronDown, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import ExportButton from '../../../components/ExportButton.jsx'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { getInventoryItems } from '../../../api/inventoryItems.api.js'
import { useBranches } from '../../../queries/branches/branches.queries.js'
import { useInventoryItems } from '../../../queries/inventoryItems/inventoryItems.queries.js'
import { useWarehouses } from '../../../queries/warehouses/warehouses.queries.js'
import { fetchAllPages } from '../../../utils/exportExcel.js'
import InventoryTabs from '../InventoryTabs.jsx'
import {
  expiryRiskClass,
  expiryRiskOptions,
  formatExpiry,
  formatPkr,
  quantityLabel,
  refName,
  stateClass,
  stateLabel,
  stateOptions,
  stateTabs,
  unitLabel,
} from './inventoryItemRecords.js'

const limit = 10

function InventoryItemsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [branchId, setBranchId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [expiryRisk, setExpiryRisk] = useState('')
  const [stateTab, setStateTab] = useState('all')
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, branchId, warehouseId, stateFilter, expiryRisk, stateTab])

  useEffect(() => {
    setWarehouseId('')
  }, [branchId])

  const state = stateTab !== 'all' ? stateTab : stateFilter

  const listParams = {
    page,
    limit,
    search: debouncedSearch,
    warehouseId,
    branchId,
    productId: '',
    state,
    expiryRisk,
  }

  const itemsQuery = useInventoryItems(listParams)
  const branchesQuery = useBranches({ page: 1, limit: 100, search: '', status: '' })
  const warehousesQuery = useWarehouses({
    page: 1,
    limit: 100,
    search: '',
    status: '',
    branchId,
  })

  const items = (itemsQuery.data?.data || []).map((item) => ({ ...item, id: item._id }))
  const total = itemsQuery.data?.meta?.total ?? 0
  const summary = itemsQuery.data?.meta?.summary || null
  const stateCounts = itemsQuery.data?.meta?.states || {}
  const expiryAttention = itemsQuery.data?.meta?.expiryAttention || null
  const selected = items.find((item) => item.id === selectedId) || null

  const inventoryValue = Number(summary?.inventoryValue) || 0
  const activeBatches = summary?.activeBatches ?? 0
  const expiryWithin30Days = summary?.expiryWithin30Days ?? 0
  const heldBatches = summary?.heldBatches ?? 0
  const damagedBatches = summary?.damagedBatches ?? 0

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, total)
  const tableSummary =
    total <= limit
      ? `Showing all ${total} ${total === 1 ? 'batch' : 'batches'}`
      : `Showing ${rangeStart} to ${rangeEnd} of ${total} batches`

  useEffect(() => {
    if (!items.length) {
      setSelectedId('')
      return
    }
    if (!items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0].id)
    }
  }, [items, selectedId])

  const branchOptions = [
    {
      label: branchesQuery.isError
        ? 'Could not load branches'
        : branchesQuery.isLoading
          ? 'Loading branches...'
          : 'All branches',
      value: '',
    },
    ...(branchesQuery.data?.data || []).map((branch) => ({
      value: branch._id,
      label: branch.name,
    })),
  ]

  const warehouseOptions = [
    {
      label: warehousesQuery.isError
        ? 'Could not load warehouses'
        : warehousesQuery.isLoading
          ? 'Loading warehouses...'
          : 'All warehouses',
      value: '',
    },
    ...(warehousesQuery.data?.data || []).map((warehouse) => ({
      value: warehouse._id,
      label: warehouse.name,
    })),
  ]

  const columns = [
    {
      key: 'product',
      label: 'Product',
      isRowHeader: true,
      exportValue: (item) => `${item.sku || ''} ${item.productName || ''}`.trim(),
      renderCell: (item) => (
        <div>
          <p className="font-mono text-[12px] text-slate-400">{item.sku || '—'}</p>
          <p className="text-[13px] font-medium text-slate-800">{item.productName || '—'}</p>
        </div>
      ),
    },
    {
      key: 'warehouse',
      label: 'Warehouse',
      exportValue: (item) => refName(item.warehouseId),
      renderCell: (item) => (
        <span className="text-[13px] text-slate-600">{refName(item.warehouseId) || '—'}</span>
      ),
    },
    {
      key: 'batchNumber',
      label: 'Batch',
      renderCell: (item) => (
        <span className="font-mono text-[12px] text-slate-600">{item.batchNumber || '—'}</span>
      ),
    },
    {
      key: 'serialNumber',
      label: 'Serial',
      exportValue: (item) => item.serialNumber || '',
      renderCell: (item) => (
        <span className="font-mono text-[12px] text-slate-400">{item.serialNumber || '—'}</span>
      ),
    },
    {
      key: 'expiryDate',
      label: 'Expiry',
      exportValue: (item) => formatExpiry(item.expiryDate),
      renderCell: (item) => (
        <span className="text-[13px] text-slate-600">{formatExpiry(item.expiryDate)}</span>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      exportValue: (item) => quantityLabel(item),
      renderCell: (item) => (
        <span className="text-[13px] font-medium text-slate-800">{quantityLabel(item)}</span>
      ),
    },
    {
      key: 'unitCost',
      label: 'Unit cost (PKR)',
      className: 'text-right uppercase tracking-wide',
      cellClassName: 'text-right',
      exportValue: (item) => item.unitCost ?? '',
      renderCell: (item) => {
        const cost = Number(item.unitCost)
        return (
          <span className="text-[13px] text-slate-700">
            {Number.isNaN(cost)
              ? '—'
              : cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )
      },
    },
    {
      key: 'state',
      label: 'State',
      exportValue: (item) => item.stateLabel || stateLabel[item.state] || item.state || '',
      renderCell: (item) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
            stateClass[item.state] || 'bg-slate-100 text-slate-500'
          }`}
        >
          {item.stateLabel || stateLabel[item.state] || item.state || '—'}
        </span>
      ),
    },
    {
      key: 'expiryRisk',
      label: 'Expiry risk',
      exportValue: (item) => item.expiryRiskLabel || item.expiryRisk || '',
      renderCell: (item) => {
        const risk = item.expiryRisk
        const label = item.expiryRiskLabel || risk || '—'
        if (risk === 'ok') {
          return <span className="text-[12px] text-slate-400">{label}</span>
        }
        return (
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium ${
              expiryRiskClass[risk] || 'bg-slate-100 text-slate-500'
            }`}
          >
            {label}
          </span>
        )
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
            loadRows={() =>
              fetchAllPages(getInventoryItems, {
                search: debouncedSearch,
                warehouseId,
                branchId,
                productId: '',
                state,
                expiryRisk,
              })
            }
          />
        </div>
      </div>

      <InventoryTabs />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Inventory value"
          value={formatPkr(inventoryValue, { compact: true })}
          hint={summary?.warehouseName || 'at purchase cost'}
          action={
            <button type="button" className="cursor-pointer text-xs font-medium text-[#2f6fed]">
              View print
            </button>
          }
        />
        <Metric
          label="Active batches"
          value={Number(activeBatches).toLocaleString('en-US')}
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
          label="Expiry within 30 days"
          value={Number(expiryWithin30Days).toLocaleString('en-US')}
          action={
            <button
              type="button"
              onClick={() => setExpiryRisk('expiring_soon')}
              className="inline-flex cursor-pointer rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
            >
              Expiring soon
            </button>
          }
        />
        <Metric
          label="Held / damaged"
          value={`${Number(heldBatches).toLocaleString('en-US')} / ${Number(damagedBatches).toLocaleString('en-US')}`}
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
            Search by product, batch, or serial. Filter by branch, warehouse, state, and expiry risk.
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
          <FilterSelect value={branchId} onChange={setBranchId} ariaLabel="Branch" options={branchOptions} />
          <FilterSelect
            value={warehouseId}
            onChange={setWarehouseId}
            ariaLabel="Warehouse"
            options={warehouseOptions}
          />
          <FilterSelect
            value={stateTab !== 'all' ? stateTab : stateFilter}
            onChange={(value) => {
              setStateFilter(value)
              setStateTab(value || 'all')
            }}
            ariaLabel="State"
            options={stateOptions}
          />
          <FilterSelect
            value={expiryRisk}
            onChange={setExpiryRisk}
            ariaLabel="Expiry risk"
            options={expiryRiskOptions}
          />
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 pb-3">
          {stateTabs.map((tab) => {
            const selectedTab = stateTab === tab.key
            const count = stateCounts[tab.key] ?? 0
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
          data={items}
          pagination
          rowsPerPage={limit}
          page={page}
          totalCount={total}
          onPageChange={setPage}
          summary={tableSummary}
          className="h-auto! max-h-none!"
          contentClassName="min-w-[1100px]"
          onRowPress={(item) => setSelectedId(item.id)}
          emptyContent={
            itemsQuery.isError
              ? itemsQuery.error.response?.data?.message || 'Could not load inventory items.'
              : itemsQuery.isLoading
                ? 'Loading inventory items...'
                : 'No inventory items match these filters.'
          }
          rowClassName={(item) =>
            item.id === selectedId
              ? 'row-selected cursor-pointer border-b border-slate-100'
              : 'cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50'
          }
        />
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Expiry attention</h2>
          {expiryAttention ? (
            <>
              <p className="mt-1 text-sm text-slate-500">
                {expiryAttention.productName || '—'} · {expiryAttention.batchNumber || '—'}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                    Expires / remaining
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                    {formatExpiry(expiryAttention.expiryDate)} · {expiryAttention.daysRemaining ?? '—'} days
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                    Quantity / value
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                    {Number(expiryAttention.quantity).toLocaleString('en-US')} ·{' '}
                    {formatPkr(expiryAttention.lineValue)}
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
                {selected.sku || '—'} · {selected.batchNumber || '—'} ·{' '}
                {selected.stateLabel || stateLabel[selected.state] || selected.state || '—'}
                {selected.unit ? ` · ${unitLabel(selected.unit)}` : ''}
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

function Metric({ label, value, action, hint }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</p>
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
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
