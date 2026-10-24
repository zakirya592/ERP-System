import { useEffect, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ExportButton from '../../../components/ExportButton.jsx'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { getStockMovements } from '../../../api/stockMovements.api.js'
import { useBranches } from '../../../queries/branches/branches.queries.js'
import { useStockMovement, useStockMovements } from '../../../queries/stockMovements/stockMovements.queries.js'
import { useWarehouses } from '../../../queries/warehouses/warehouses.queries.js'
import { fetchAllPages } from '../../../utils/exportExcel.js'
import InventoryTabs from '../InventoryTabs.jsx'
import {
  formatPkr,
  formatPosted,
  movementQty,
  movementTypeOptions,
  refName,
  unitLabel,
} from './movementRecords.js'

const limit = 20

const typeClass = {
  purchase: 'text-emerald-600',
  sale: 'text-sky-600',
  transfer: 'text-amber-600',
  adjustment: 'text-violet-600',
  Purchase: 'text-emerald-600',
  Sale: 'text-sky-600',
  Transfer: 'text-amber-600',
  Adjustment: 'text-violet-600',
}

function movementColumns(selectedId) {
  return [
    {
      key: 'movementDate',
      label: 'Movement date',
      className: 'uppercase tracking-wide',
      exportValue: (item) => formatPosted(item.movementDate),
      renderCell: (item) => (
        <span
          className={`text-[13px] whitespace-nowrap ${
            item.id === selectedId ? 'font-medium text-[#2f6fed]' : 'text-slate-500'
          }`}
        >
          {formatPosted(item.movementDate)}
        </span>
      ),
    },
    {
      key: 'referenceNumber',
      label: 'Reference',
      className: 'uppercase tracking-wide',
      exportValue: (item) => item.referenceNumber || item.movementNumber || '',
      renderCell: (item) => (
        <span className="font-mono text-[12px] text-slate-500">
          {item.referenceNumber || item.movementNumber || '—'}
        </span>
      ),
    },
    {
      key: 'productName',
      label: 'Product',
      className: 'uppercase tracking-wide',
      isRowHeader: true,
      renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.productName || '—'}</span>,
    },
    {
      key: 'warehouse',
      label: 'Location',
      className: 'uppercase tracking-wide',
      exportValue: (item) => refName(item.warehouseId),
      renderCell: (item) => (
        <span className="text-[13px] text-slate-500">{refName(item.warehouseId) || '—'}</span>
      ),
    },
    {
      key: 'movementType',
      label: 'Type',
      className: 'uppercase tracking-wide',
      exportValue: (item) => item.movementTypeLabel || item.movementType || '',
      renderCell: (item) => (
        <span
          className={`text-[13px] font-medium ${
            typeClass[item.movementType] || typeClass[item.movementTypeLabel] || 'text-slate-500'
          }`}
        >
          {item.movementTypeLabel || item.movementType || '—'}
        </span>
      ),
    },
    {
      key: 'qty',
      label: 'Qty',
      className: 'text-right uppercase tracking-wide',
      cellClassName: 'text-right',
      exportValue: (item) => movementQty(item),
      renderCell: (item) => {
        const qty = movementQty(item)
        return (
          <span className={`text-[13px] font-medium ${qty < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
            {qty > 0 ? `+${qty}` : qty}
          </span>
        )
      },
    },
    {
      key: 'unit',
      label: 'Unit',
      className: 'uppercase tracking-wide',
      exportValue: (item) => unitLabel(item.unit),
      renderCell: (item) => <span className="text-[13px] text-slate-500">{unitLabel(item.unit)}</span>,
    },
    {
      key: 'lineValue',
      label: 'Value (PKR)',
      className: 'text-right uppercase tracking-wide',
      cellClassName: 'text-right',
      exportValue: (item) => item.lineValue ?? '',
      renderCell: (item) => <span className="text-[13px] text-slate-700">{formatPkr(item.lineValue)}</span>,
    },
    {
      key: 'user',
      label: 'User',
      className: 'uppercase tracking-wide',
      exportValue: (item) => refName(item.createdBy),
      renderCell: (item) => (
        <span className="text-[13px] text-slate-500">{refName(item.createdBy) || '—'}</span>
      ),
    },
  ]
}

function StockMovementsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [branchId, setBranchId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [movementType, setMovementType] = useState('')
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, branchId, warehouseId, movementType])

  useEffect(() => {
    setWarehouseId('')
  }, [branchId])

  const listParams = {
    page,
    limit,
    search: debouncedSearch,
    branchId,
    warehouseId,
    productId: '',
    movementType,
  }

  const movementsQuery = useStockMovements(listParams)
  const detailQuery = useStockMovement(selectedId)
  const branchesQuery = useBranches({ page: 1, limit: 100, search: '', status: '' })
  const warehousesQuery = useWarehouses({
    page: 1,
    limit: 100,
    search: '',
    status: '',
    branchId,
  })

  const movements = (movementsQuery.data?.data || []).map((item) => ({ ...item, id: item._id }))
  const total = movementsQuery.data?.meta?.total ?? 0
  const summaryMeta = movementsQuery.data?.meta?.summary || null
  const selected = detailQuery.data?.data || movements.find((item) => item.id === selectedId) || null
  const sourceTrace = selected?.sourceTrace || null

  const quantityIn = Number(summaryMeta?.quantityIn) || 0
  const quantityOut = Number(summaryMeta?.quantityOut) || 0
  const net = Number(summaryMeta?.netMovement)
  const netValue = Number.isNaN(net) ? quantityIn - quantityOut : net
  const movementsToday = summaryMeta?.movementsToday ?? total

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, total)
  const tableSummary =
    total <= limit
      ? `Showing all ${total} ${total === 1 ? 'movement' : 'movements'}`
      : `Showing ${rangeStart} to ${rangeEnd} of ${total} movements`

  useEffect(() => {
    if (!movements.length) {
      setSelectedId('')
      return
    }
    if (!movements.some((item) => item.id === selectedId)) {
      setSelectedId(movements[0].id)
    }
  }, [movements, selectedId])

  const columns = movementColumns(selectedId)
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
            Track every inventory movement posted from purchases, sales, transfers, and adjustments. All quantities and
            values are saved in PKR.
          </p>
        </div>
        <ExportButton
          filename="stock-movements"
          sheetName="Stock Movements"
          label="Export Movements"
          columns={columns}
          loadRows={() =>
            fetchAllPages(getStockMovements, {
              search: debouncedSearch,
              branchId,
              warehouseId,
              productId: '',
              movementType,
            })
          }
        />
      </div>

      <InventoryTabs />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Movements today" value={String(movementsToday)} hint="posted in PKR" />
        <Metric
          label="Quantity in"
          value={quantityIn.toLocaleString('en-US')}
          hint={summaryMeta?.warehouseName ? summaryMeta.warehouseName : 'from purchases'}
        />
        <Metric label="Quantity out" value={quantityOut.toLocaleString('en-US')} hint="from sales" />
        <Metric
          label="Net movement"
          value={`${netValue > 0 ? '+' : ''}${netValue.toLocaleString('en-US')}`}
          hint="in minus out"
          valueClassName={netValue < 0 ? 'text-rose-500' : 'text-emerald-600'}
        />
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Movement register</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Search by product or document. Filter by branch, warehouse, and type. Values are shown in PKR.
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
          <FilterSelect value={branchId} onChange={setBranchId} ariaLabel="Branch" options={branchOptions} />
          <FilterSelect
            value={warehouseId}
            onChange={setWarehouseId}
            ariaLabel="Warehouse"
            options={warehouseOptions}
          />
          <FilterSelect
            value={movementType}
            onChange={setMovementType}
            ariaLabel="Movement type"
            options={movementTypeOptions}
          />
        </div>

        <GlobalTable
          ariaLabel="Movement register"
          columns={columns}
          data={movements}
          pagination
          rowsPerPage={limit}
          page={page}
          totalCount={total}
          onPageChange={setPage}
          summary={tableSummary}
          className="h-auto! max-h-none!"
          contentClassName="min-w-[980px]"
          onRowPress={(item) => setSelectedId(item.id)}
          emptyContent={
            movementsQuery.isError
              ? movementsQuery.error.response?.data?.message || 'Could not load stock movements.'
              : movementsQuery.isLoading
                ? 'Loading movements...'
                : 'No movements match these filters.'
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
          <h2 className="text-sm font-semibold text-slate-900">Source trace</h2>
          {detailQuery.isLoading && selectedId ? (
            <p className="mt-3 text-sm text-slate-400">Loading source trace...</p>
          ) : detailQuery.isError ? (
            <p className="mt-3 text-sm text-rose-500">
              {detailQuery.error.response?.data?.message || 'Could not load this movement.'}
            </p>
          ) : selected ? (
            <>
              <p className="mt-1 text-sm text-slate-500">
                {selected.movementTypeDetailLabel
                  ? selected.movementTypeDetailLabel
                  : `Posted by ${sourceTrace?.createdByName || refName(selected.createdBy) || '—'}`}
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <Trace label="Branch" value={refName(selected.branchId) || '—'} />
                <Trace label="Warehouse" value={refName(selected.warehouseId) || '—'} />
                <Trace
                  label="Document"
                  value={sourceTrace?.referenceNumber || selected.referenceNumber || selected.movementNumber || '—'}
                  mono
                />
                <Trace
                  label="Posted"
                  value={formatPosted(sourceTrace?.movementDate || selected.movementDate)}
                />
                {(sourceTrace?.ledgerNumber || selected.ledgerNumber) && (
                  <Trace label="Ledger" value={sourceTrace?.ledgerNumber || selected.ledgerNumber} mono />
                )}
              </dl>
              <button
                type="button"
                onClick={() =>
                  toast.info(
                    `${sourceTrace?.referenceNumber || selected.referenceNumber || selected.movementNumber} is the source document for this movement.`,
                  )
                }
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
            Every purchase, sale, transfer, and adjustment posts a movement. The quantity on hand is the sum of those
            movements.
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
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
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
