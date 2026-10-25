import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { Eye, Pencil, Plus, Search } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ExportButton from '../../components/ExportButton.jsx'
import GlobalTable from '../../components/GlobalTable.jsx'
import { getCustomers } from '../../api/customers.api.js'
import { useBranches } from '../../queries/branches/branches.queries.js'
import { useCurrencies } from '../../queries/currencies/currencies.queries.js'
import { useCustomer, useCustomers } from '../../queries/customers/customers.queries.js'
import { fetchAllPages } from '../../utils/exportExcel.js'
import {
  customerAccountNote,
  currencyLabel,
  display,
  formatMoney,
  mapCustomer,
  moneyPlain,
  paymentTermsOptions,
  statusClassName,
} from './customerRecords.js'

const limit = 20

const tabs = [
  { key: 'customer', label: 'Customers', singular: 'Customer' },
  { key: 'supplier', label: 'Suppliers', singular: 'Supplier' },
  { key: 'employee', label: 'Employees', singular: 'Employee' },
  { key: 'driver', label: 'Drivers', singular: 'Driver' },
  { key: 'partnership', label: 'Partnerships', singular: 'Partnership' },
  { key: 'govt', label: 'Govt', singular: 'Govt' },
  { key: 'transporter', label: 'Transporters', singular: 'Transporter' },
]

function customerColumns(onView, onEdit) {
  return [
    {
      key: 'name',
      label: 'Party / code',
      isRowHeader: true,
      renderCell: (item) => (
        <div>
          <button
            type="button"
            onClick={() => onView(item)}
            className="cursor-pointer text-sm font-medium text-slate-800"
          >
            {display(item.name)}
          </button>
          <p className="text-xs text-slate-400">{display(item.code)}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      renderCell: (item) => (
        <div>
          <p className="text-sm text-slate-700">{display(item.contactName)}</p>
          <p className="text-xs text-slate-400">{display(item.phone)}</p>
        </div>
      ),
    },
    {
      key: 'currency',
      label: 'Currency',
      renderCell: (item) => <span className="text-sm text-slate-700">{display(item.currency)}</span>,
    },
    {
      key: 'account',
      label: 'AR / AP account',
      renderCell: (item) => (
        <span className="text-sm text-slate-700">{display(item.arApAccount || item.receivableAccount)}</span>
      ),
    },
    {
      key: 'terms',
      label: 'Terms',
      renderCell: (item) => <span className="text-sm text-slate-700">{display(item.paymentTermsLabel)}</span>,
    },
    {
      key: 'receivable',
      label: 'Receivable (PKR)',
      className: 'text-right',
      cellClassName: 'text-right',
      renderCell: (item) => <span className="text-sm text-slate-700">{moneyPlain(item.receivable)}</span>,
    },
    {
      key: 'payable',
      label: 'Payable (PKR)',
      className: 'text-right',
      cellClassName: 'text-right',
      renderCell: (item) => <span className="text-sm text-slate-700">{moneyPlain(item.payable)}</span>,
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
            onClick={() => onView(item)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            aria-label={`Edit ${item.name}`}
            onClick={() => onEdit(item)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Pencil size={16} />
          </button>
        </div>
      ),
    },
  ]
}

function CustomerPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState('customer')
  const [query, setQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [branchId, setBranchId] = useState('')
  const [status, setStatus] = useState('')
  const [currencyId, setCurrencyId] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
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

  const customersQuery = useCustomers({
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

  const pageRows = (customersQuery.data?.data || []).map(mapCustomer)
  const total = customersQuery.data?.meta?.total ?? pageRows.length
  const summary = customersQuery.data?.meta?.summary || {}
  const selected = pageRows.find((row) => row.id === selectedId) || pageRows[0] || null

  const detailQuery = useCustomer(tab === 'customer' ? selected?.id : null)
  const detail = detailQuery.data?.data ? mapCustomer(detailQuery.data.data) : null
  const profile = detail || selected

  const branchOptions = (branchesQuery.data?.data || []).map((item) => ({
    id: item._id,
    name: item.name,
  }))
  const currencyOptions = (currenciesQuery.data?.data || []).map((item) => ({
    id: item._id,
    label: currencyLabel(item) || item.name,
  }))

  const partyCount = summary.total ?? total ?? '—'
  const activeCount = summary.active ?? '—'
  const creditCount = summary.creditCustomers ?? '—'
  const inactiveCount = summary.inactiveParties ?? summary.inactive ?? '—'
  const receivableBalance = summary.receivableBalance ?? summary.totalReceivable

  const activeTab = tabs.find((item) => item.key === tab)
  const columns = customerColumns(
    (item) => navigate(`/sales/customers/${item.id}`),
    (item) => navigate(`/sales/customers/${item.id}/edit`),
  )

  function changeTab(nextTab) {
    if (nextTab === 'supplier') {
      navigate('/purchases/suppliers')
      return
    }
    setTab(nextTab)
  }

  function clearFilters() {
    setQuery('')
    setBranchId('')
    setStatus('')
    setCurrencyId('')
    setPaymentTerms('')
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Directories</p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Customer</h1>
          <p className="mt-2 text-sm text-slate-500">
            A shared party directory for customers, suppliers, people, and service partners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            filename="customers"
            sheetName="Customers"
            columns={columns}
            loadRows={async () => {
              const rows = await fetchAllPages(getCustomers, {
                search: debouncedSearch,
                status,
                paymentTerms,
                currencyId,
                branchId,
              })
              return rows.map(mapCustomer)
            }}
          />
          <Button size="sm" onPress={() => navigate('/sales/customers/new')}>
            <Plus size={15} />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-[#e6edf5] p-1">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => changeTab(item.key)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              tab === item.key
                ? 'bg-white font-medium text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={activeTab?.label || 'Customers'}
          value={String(partyCount)}
          hint={`${activeCount} active`}
        />
        <StatCard
          label="Receivable balance"
          value={receivableBalance == null ? '—' : formatMoney(receivableBalance)}
          hint="PKR base"
        />
        <StatCard label="Credit customers" value={String(creditCount)} hint="terms configured" />
        <StatCard label="Inactive parties" value={String(inactiveCount)} hint="retained for history" />
      </div>

      {tab === 'customer' ? (
        <>
          <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold">Customer register</h2>
                <p className="text-xs text-slate-500">Contact, account mapping, and commercial terms.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <label className="relative">
                  <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search party or contact"
                    className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-8 text-sm outline-none placeholder:text-slate-400 focus:border-sky-400 sm:w-56"
                  />
                </label>
                <select
                  aria-label="Branch"
                  value={branchId}
                  onChange={(event) => changeFilter(setBranchId)(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
                >
                  <option value="">All branches</option>
                  {branchOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Status"
                  value={status}
                  onChange={(event) => changeFilter(setStatus)(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  aria-label="Currency"
                  value={currencyId}
                  onChange={(event) => changeFilter(setCurrencyId)(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
                >
                  <option value="">All currencies</option>
                  {currencyOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Payment terms"
                  value={paymentTerms}
                  onChange={(event) => changeFilter(setPaymentTerms)(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
                >
                  <option value="">All terms</option>
                  {paymentTermsOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="cursor-pointer px-2 py-2 text-sm font-medium text-[#2f6fed]"
                >
                  Clear filters
                </button>
              </div>
            </div>

            <GlobalTable
              ariaLabel="Customer register"
              columns={columns}
              data={pageRows}
              pagination
              rowsPerPage={limit}
              page={page}
              totalCount={total}
              onPageChange={setPage}
              emptyContent={
                customersQuery.isError
                  ? customersQuery.error.response?.data?.message || 'Could not load customers.'
                  : customersQuery.isLoading
                    ? 'Loading customers...'
                    : 'No customers match these filters.'
              }
              summary={
                total
                  ? `Showing ${pageRows.length} ${pageRows.length === 1 ? 'record' : 'records'}${selected ? ' · 1 selected' : ''}`
                  : undefined
              }
              onRowPress={(item) => setSelectedId(item.id)}
              rowClassName={(item) =>
                `cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50 ${
                  selected?.id === item.id ? 'row-selected' : ''
                }`
              }
            />
          </section>

          {profile && (
            <section className="grid items-start gap-x-2 gap-y-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <article className="rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[15px] font-semibold text-slate-900">{display(profile.name)}</h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Selected customer · {display(profile.code)}
                      {detailQuery.isLoading ? ' · loading…' : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (profile.ledgerPath) {
                        navigate(profile.ledgerPath)
                        return
                      }
                      toast.info(`Ledger for ${profile.name} is not linked yet.`)
                    }}
                    className="cursor-pointer text-sm font-medium whitespace-nowrap text-sky-600"
                  >
                    Open customer ledger
                  </button>
                </div>
                <dl className="mt-4 space-y-3">
                  <DetailRow label="Email" value={display(profile.email)} />
                  <DetailRow
                    label="Credit limit / available"
                    value={`${formatMoney(profile.creditLimit, profile.currency)} / ${formatMoney(profile.availableCredit, profile.currency)}`}
                  />
                  <DetailRow
                    label="Default terms"
                    value={`${display(profile.paymentTermsLabel)} · ${display(profile.currency)}`}
                  />
                  <DetailRow label="Phone" value={display(profile.phone)} />
                  <DetailRow label="Address" value={display(profile.address)} />
                </dl>
              </article>

              <article className="rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm">
                <h2 className="text-[15px] font-semibold text-slate-900">Party accounts</h2>
                <p className="mt-0.5 text-xs text-slate-400">Traceable financial relationships</p>
                <dl className="mt-3 space-y-3">
                  <DetailRow label="Receivable account" value={display(profile.receivableAccount)} />
                  <DetailRow label="AR / AP" value={display(profile.arApAccount)} />
                  <DetailRow label="Receivable" value={formatMoney(profile.receivable)} />
                  <DetailRow label="Payable" value={formatMoney(profile.payable)} />
                </dl>
                <div className="mt-3 rounded-xl bg-[#eaf3ff] px-4 py-3">
                  <p className="text-sm font-semibold text-[#2f6fed]">
                    Receivable and payable accounts stay separate
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {profile.balanceNote || customerAccountNote}
                  </p>
                </div>
              </article>
            </section>
          )}
        </>
      ) : (
        <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">{activeTab?.label || 'Directory'}</h2>
          <p className="mt-1 text-sm text-slate-400">Nothing is configured in this view yet.</p>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value, hint }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</p>
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </article>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-800">{value}</dd>
    </div>
  )
}

export default CustomerPage
