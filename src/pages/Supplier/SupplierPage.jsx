import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { ChevronDown, Eye, Pencil, Plus, Search } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ExportButton from '../../components/ExportButton.jsx'
import GlobalTable from '../../components/GlobalTable.jsx'
import { getSuppliers } from '../../api/suppliers.api.js'
import { useBranches } from '../../queries/branches/branches.queries.js'
import { useCurrencies } from '../../queries/currencies/currencies.queries.js'
import { useSupplier, useSuppliers } from '../../queries/suppliers/suppliers.queries.js'
import { fetchAllPages } from '../../utils/exportExcel.js'
import {
  display,
  formatAsOf,
  mapSupplier,
  money,
  moneyLabel,
  paymentTermsFilterOptions,
  statusClassName,
  statusFilterOptions,
} from './supplierRecords.js'

const limit = 20

const tabs = [
  { key: 'customers', label: 'Customers', to: '/sales/customers' },
  { key: 'suppliers', label: 'Suppliers', to: '/purchases/suppliers' },
  { key: 'employees', label: 'Employees', to: '/organization/employees' },
  { key: 'owners', label: 'Owners', to: '/organization/owners' },
  { key: 'drivers', label: 'Drivers' },
  { key: 'partnerships', label: 'Partnerships', to: '/organization/partnerships' },
  { key: 'govt', label: 'Govt' },
  { key: 'transporters', label: 'Transporters' },
]

function supplierColumns(onView, onEdit) {
  return [
    {
      key: 'name',
      label: 'Supplier / code',
      isRowHeader: true,
      exportValue: (item) => `${item.name} (${item.code})`,
      renderCell: (item) => (
        <div>
          <p className="text-sm font-medium text-slate-800">{item.name}</p>
          <p className="text-xs text-slate-400">{item.code}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact / email',
      exportValue: (item) => [item.phone, item.email].filter(Boolean).join(' / '),
      renderCell: (item) => (
        <div>
          <p className="text-sm text-slate-700">{display(item.phone)}</p>
          <p className="text-xs text-slate-400">{display(item.email)}</p>
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      renderCell: (item) => <span className="text-sm text-slate-600">{display(item.address)}</span>,
    },
    { key: 'currency', label: 'Currency' },
    { key: 'account', label: 'Payable account' },
    { key: 'terms', label: 'Terms' },
    {
      key: 'outstanding',
      label: 'Outstanding (PKR)',
      className: 'text-right',
      cellClassName: 'text-right',
      exportValue: (item) => item.outstanding,
      renderCell: (item) => <span className="text-sm text-slate-700">{money(item.outstanding)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      renderCell: (item) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClassName(item.status)}`}>
          {item.status}
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
            onClick={(event) => {
              event.stopPropagation()
              onView(item)
            }}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            aria-label={`Edit ${item.name}`}
            onClick={(event) => {
              event.stopPropagation()
              onEdit(item)
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

function SupplierPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [branchId, setBranchId] = useState('')
  const [status, setStatus] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [currencyId, setCurrencyId] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(query.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function changeFilter(setter) {
    return (value) => {
      setter(value)
      setPage(1)
    }
  }

  const suppliersQuery = useSuppliers({
    page,
    limit,
    search: debouncedSearch,
    status,
    paymentTerms,
    currencyId,
    branchId,
  })
  const branchesQuery = useBranches({ page: 1, limit: 100, search: '', status: 'active' })
  const currenciesQuery = useCurrencies({ page: 1, limit: 100, search: '', status: 'active' })

  const pageRows = (suppliersQuery.data?.data || []).map(mapSupplier)
  const total = suppliersQuery.data?.meta?.total ?? pageRows.length
  const summary = suppliersQuery.data?.meta?.summary || {}
  const asOfLabel = formatAsOf(summary.asOf)
  const selected = pageRows.find((supplier) => supplier.id === selectedId) || pageRows[0] || null

  const detailQuery = useSupplier(selected?.id)
  const detail = detailQuery.data?.data ? mapSupplier(detailQuery.data.data) : null
  const profile = detail || selected

  const branchOptions = [
    { label: branchesQuery.isLoading ? 'Loading branches...' : 'All branches', value: '' },
    ...(branchesQuery.data?.data || []).map((branch) => ({
      value: branch._id,
      label: branch.name,
    })),
  ]
  const currencyOptions = [
    { label: currenciesQuery.isLoading ? 'Loading currencies...' : 'All currencies', value: '' },
    ...(currenciesQuery.data?.data || []).map((currency) => ({
      value: currency._id,
      label: currency.code ? `${currency.code} — ${currency.name}` : currency.name,
    })),
  ]

  const columns = supplierColumns(
    (item) => navigate(`/purchases/suppliers/${item.id}`),
    (item) => navigate(`/purchases/suppliers/${item.id}/edit`),
  )

  function clearFilters() {
    setQuery('')
    setBranchId('')
    setStatus('')
    setPaymentTerms('')
    setCurrencyId('')
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Directories</p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Supplier</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage supplier contacts, payable accounts, and commercial terms in PKR.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            filename="suppliers"
            sheetName="Suppliers"
            columns={columns}
            loadRows={async () => {
              const rows = await fetchAllPages(getSuppliers, {
                search: debouncedSearch,
                status,
                paymentTerms,
                currencyId,
                branchId,
              })
              return rows.map(mapSupplier)
            }}
          />
          <Button size="sm" onPress={() => navigate('/purchases/suppliers/new')}>
            <Plus size={15} />
            Add Supplier
          </Button>
        </div>
      </div>

      <div className="inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-[#e6edf5] p-1">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => item.to && navigate(item.to)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm ${
              item.key === 'suppliers'
                ? 'bg-white font-medium text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total payable"
          value={moneyLabel(summary.totalPayable ?? 0)}
          hint={`${summary.suppliersWithBalance ?? summary.total ?? total} suppliers`}
          hintClassName="text-emerald-600"
        />
        <StatCard
          label="Current"
          value={moneyLabel(summary.current ?? 0)}
          hint="within terms"
          hintClassName="text-emerald-600"
        />
        <StatCard
          label="1-30 days overdue"
          value={moneyLabel(summary.overdue1to30 ?? 0)}
          hint="due for payment"
          hintClassName="text-amber-500"
        />
        <StatCard
          label="Over 30 days"
          value={moneyLabel(summary.overdueOver30 ?? 0)}
          hint="priority"
          hintClassName="text-rose-500"
        />
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Supplier register</h2>
            <p className="mt-0.5 text-sm text-slate-400">Contact, account mapping, and commercial terms.</p>
          </div>
          <p className="text-sm text-slate-400">{total} suppliers</p>
        </div>

        <div className="flex flex-col gap-2 px-5 py-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search supplier, code, or contact"
              className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <FilterSelect value={branchId} onChange={changeFilter(setBranchId)} ariaLabel="Branch" options={branchOptions} />
          <FilterSelect value={status} onChange={changeFilter(setStatus)} ariaLabel="Status" options={statusFilterOptions} />
          <FilterSelect
            value={paymentTerms}
            onChange={changeFilter(setPaymentTerms)}
            ariaLabel="Payment terms"
            options={paymentTermsFilterOptions}
          />
          <FilterSelect
            value={currencyId}
            onChange={changeFilter(setCurrencyId)}
            ariaLabel="Currency"
            options={currencyOptions}
          />
          <button type="button" onClick={clearFilters} className="cursor-pointer px-2 py-2 text-sm font-medium text-sky-600">
            Clear filters
          </button>
        </div>

        <GlobalTable
          ariaLabel="Supplier register"
          columns={columns}
          data={pageRows}
          pagination
          rowsPerPage={limit}
          page={page}
          totalCount={total}
          onPageChange={setPage}
          className="h-auto! max-h-none!"
          emptyContent={
            suppliersQuery.isError
              ? suppliersQuery.error.response?.data?.message || 'Could not load suppliers.'
              : suppliersQuery.isLoading
                ? 'Loading suppliers...'
                : 'No suppliers match these filters.'
          }
          onRowPress={(item) => setSelectedId(item.id)}
          rowClassName={(item) =>
            `cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50 ${
              item.id === selected?.id ? 'row-selected' : ''
            }`
          }
        />
        <p className="border-t border-slate-100 px-5 py-2 text-xs text-slate-400">
          Contact accounts stay separate.
          {summary.asOf ? ` · As of ${asOfLabel}` : ''}
        </p>
      </section>

      {profile && (
        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
          <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900">{profile.name}</h2>
                <p className="mt-0.5 text-xs text-slate-400">Selected supplier · {profile.code}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/purchases/suppliers/${profile.id}/edit`)}
                  className="text-sm font-medium whitespace-nowrap text-sky-600"
                >
                  Edit Supplier
                </button>
                <button
                  type="button"
                  onClick={() => toast.success(`Ledger opened for ${profile.name}.`)}
                  className="text-sm font-medium whitespace-nowrap text-sky-600"
                >
                  Open Supplier Ledger
                </button>
              </div>
            </div>
            {detailQuery.isLoading && !detail ? (
              <p className="mt-4 text-sm text-slate-400">Loading supplier details...</p>
            ) : detailQuery.isError && !detail ? (
              <p className="mt-4 text-sm text-rose-500">
                {detailQuery.error.response?.data?.message || 'Could not load supplier details.'}
              </p>
            ) : (
              <>
                <dl className="mt-4 space-y-3">
                  <DetailRow label="Supplier code" value={display(profile.code)} />
                  <DetailRow label="Phone" value={display(profile.phone)} />
                  <DetailRow label="Email" value={display(profile.companyEmail)} />
                  <DetailRow label="Address" value={display(profile.address)} />
                  <DetailRow label="Preferred currency" value={display(profile.currency)} />
                  <DetailRow label="Payment terms" value={display(profile.terms)} />
                  <DetailRow label="Payable account" value={display(profile.account)} />
                  <DetailRow label="Status">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClassName(profile.status)}`}
                    >
                      {profile.status}
                    </span>
                  </DetailRow>
                </dl>
                <div className="mt-4 rounded-xl bg-[#eaf3ff] px-4 py-3">
                  <p className="text-sm font-semibold text-[#2f6fed]">
                    Payable balances come from posted entries
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {profile.balanceNote ||
                      'Receivable and payable accounts stay separate. Supplier advances are shown separately from outstanding invoices.'}
                  </p>
                </div>
              </>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900">Payables & posted activity</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {profile.name} · As of {asOfLabel} · {profile.currency}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toast.success(`Payables opened for ${profile.name}.`)}
                className="text-sm font-medium whitespace-nowrap text-sky-600"
              >
                View Payables
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Outstanding" value={moneyLabel(profile.outstanding, profile.currency)} />
              <MiniStat label="Current" value={moneyLabel(profile.current, profile.currency)} />
              <MiniStat
                label="Overdue"
                value={moneyLabel(profile.overdue, profile.currency)}
                valueClassName="text-amber-500"
              />
              <MiniStat
                label="Unallocated advance"
                value={moneyLabel(profile.unallocated, profile.currency)}
              />
            </div>
            {profile.nextDue && (
              <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                <p className="text-slate-500">Next due · {profile.nextDue.id}</p>
                <p className="font-medium text-slate-800">
                  {profile.nextDue.date} · {moneyLabel(profile.nextDue.amount, profile.currency)}
                </p>
              </div>
            )}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] tracking-wide text-slate-400 uppercase">
                  <tr className="border-b border-slate-100">
                    <th className="py-2 font-medium">Purchase</th>
                    <th className="py-2 font-medium">Due</th>
                    <th className="py-2 text-right font-medium">Amount (PKR)</th>
                    <th className="py-2 text-right font-medium">Paid (PKR)</th>
                    <th className="py-2 text-right font-medium">Outstanding (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {!profile.bills.length ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                        No posted bills for this supplier.
                      </td>
                    </tr>
                  ) : (
                    profile.bills.map((bill) => (
                      <tr key={bill.id} className="border-b border-slate-100 last:border-b-0">
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() => toast.success(`${bill.id} opened.`)}
                            className="font-medium text-sky-600"
                          >
                            {bill.id}
                          </button>
                        </td>
                        <td className="py-2 text-slate-500">{bill.date}</td>
                        <td className="py-2 text-right text-slate-700">{money(bill.amount)}</td>
                        <td className="py-2 text-right text-slate-700">{money(bill.paid)}</td>
                        <td className="py-2 text-right text-slate-700">{money(bill.balance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {profile.allocation && (
              <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3">
                <p className="text-sm font-semibold text-emerald-700">
                  {profile.allocation.id} · {moneyLabel(profile.allocation.amount, profile.currency)}{' '}
                  allocated
                </p>
                <p className="mt-1 text-sm text-slate-600">{profile.allocation.detail}</p>
              </div>
            )}
          </article>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value, hint, hintClassName }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</p>
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
      <p className={`mt-2 text-xs ${hintClassName}`}>{hint}</p>
    </article>
  )
}

function MiniStat({ label, value, valueClassName = 'text-slate-900' }) {
  return (
    <div>
      <p className="text-[11px] tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-base font-semibold ${valueClassName}`}>{value}</p>
    </div>
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

function DetailRow({ label, value, children }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-800">{children || value}</dd>
    </div>
  )
}

export default SupplierPage
