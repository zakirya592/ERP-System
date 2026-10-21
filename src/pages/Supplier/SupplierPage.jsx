import { useMemo, useState } from 'react'
import { Button } from '@heroui/react'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ExportButton from '../../components/ExportButton.jsx'
import GlobalTable from '../../components/GlobalTable.jsx'

const tabs = [
  { key: 'customers', label: 'Customers', to: '/sales/customers' },
  { key: 'suppliers', label: 'Suppliers', to: '/purchases/suppliers' },
  { key: 'employees', label: 'Employees' },
  { key: 'owners', label: 'Owners' },
  { key: 'drivers', label: 'Drivers' },
  { key: 'partnerships', label: 'Partnerships' },
  { key: 'govt', label: 'Govt' },
  { key: 'transporters', label: 'Transporters' },
]

const suppliers = [
  {
    id: 'S-0042',
    name: 'Summit Foods',
    contact: 'Nadia Rahman',
    phone: '+92 300 555 0188',
    email: 'nadia@summitfoods.example.com',
    companyEmail: 'accounts@summitfoods.example.com',
    address: '18 Market Road, Gulberg II, Lahore',
    currency: 'PKR',
    account: '2100-0042',
    terms: 'Net 30',
    outstanding: 42800,
    status: 'Active',
    branch: 'Central Branch',
    current: 22800,
    overdue: 20000,
    unallocated: 300,
    nextDue: { id: 'PO-02630', date: 'Oct 15', amount: 12800 },
    allocation: {
      id: 'PAY-01392',
      amount: 8600,
      detail:
        'Meridian Bank · Sep 30 · JV-01843. Applied to PO-02608; payment unallocated amount PKR 0.',
    },
    bills: [
      { id: 'PO-02594', date: 'Aug 31', amount: 8000, paid: 0, balance: 8000 },
      { id: 'PO-02608', date: 'Sep 20', amount: 20600, paid: 8600, balance: 12000 },
      { id: 'PO-02630', date: 'Oct 15', amount: 12800, paid: 0, balance: 12800 },
      { id: 'PO-02640', date: 'Oct 31', amount: 10000, paid: 0, balance: 10000 },
    ],
  },
  {
    id: 'S-0012',
    name: 'Northline Wholesale',
    contact: 'Imran Qureshi',
    phone: '+92 300 555 0112',
    email: 'imran@northline.example.com',
    companyEmail: 'imran@northline.example.com',
    address: '42 Circular Road, Shah Alam, Lahore',
    currency: 'PKR',
    account: '2100-0012',
    terms: 'Net 14',
    outstanding: 36450,
    status: 'Active',
    branch: 'Central Branch',
    invoiced: 36450,
    paid: 0,
    unallocated: 0,
    bills: [],
  },
  {
    id: 'S-0078',
    name: 'Fresh Dairy Co',
    contact: 'Sana Malik',
    phone: '+92 300 555 0178',
    email: 'sana@freshdairy.example.com',
    companyEmail: 'sana@freshdairy.example.com',
    address: '9 Dairy Lane, Model Town, Lahore',
    currency: 'PKR',
    account: '2100-0078',
    terms: 'Net 14',
    outstanding: 24200,
    status: 'Active',
    branch: 'Central Branch',
    invoiced: 24200,
    paid: 0,
    unallocated: 0,
    bills: [],
  },
  {
    id: 'S-0033',
    name: 'Packwell Supply',
    contact: 'Bilal Ahmed',
    phone: '+92 300 555 0133',
    email: 'bilal@packwell.example.com',
    companyEmail: 'bilal@packwell.example.com',
    address: '21 Industrial Road, Kot Lakhpat, Lahore',
    currency: 'PKR',
    account: '2100-0033',
    terms: 'Net 30',
    outstanding: 18900,
    status: 'Active',
    branch: 'Central Branch',
    invoiced: 18900,
    paid: 0,
    unallocated: 0,
    bills: [],
  },
  {
    id: 'S-0055',
    name: 'CleanCare',
    contact: 'Hira Noor',
    phone: '+92 300 555 0155',
    email: 'hira@cleancare.example.com',
    companyEmail: 'hira@cleancare.example.com',
    address: '12 Service Road, Johar Town, Lahore',
    currency: 'PKR',
    account: '2100-0055',
    terms: 'Net 14',
    outstanding: 12800,
    status: 'Active',
    branch: 'Central Branch',
    invoiced: 12800,
    paid: 0,
    unallocated: 0,
    bills: [],
  },
  {
    id: 'S-0091',
    name: 'Atlas Transport',
    contact: 'Kamran Ali',
    phone: '+92 300 555 0191',
    email: 'kamran@atlastransport.example.com',
    companyEmail: 'kamran@atlastransport.example.com',
    address: '5 Freight Road, Raiwind Ring, Lahore',
    currency: 'PKR',
    account: '2100-0091',
    terms: 'Net 14',
    outstanding: 8650,
    status: 'Active',
    branch: 'Central Branch',
    invoiced: 8650,
    paid: 0,
    unallocated: 0,
    bills: [],
  },
  {
    id: 'S-0104',
    name: 'Tejaratpak',
    contact: 'Ayesha Khan',
    phone: '+92 300 555 0104',
    email: 'ayesha@tejaratpak.example.com',
    companyEmail: 'ayesha@tejaratpak.example.com',
    address: '77 Hall Road, Lahore',
    currency: 'PKR',
    account: '2100-0104',
    terms: 'Net 7',
    outstanding: 4800,
    status: 'Active',
    branch: 'Central Branch',
    invoiced: 4800,
    paid: 0,
    unallocated: 0,
    bills: [],
  },
  {
    id: 'S-0120',
    name: 'Metro Mills',
    contact: 'Omar Farooq',
    phone: '+92 300 555 0120',
    email: 'omar@metromills.example.com',
    companyEmail: 'omar@metromills.example.com',
    address: '4 Mill Road, Lahore',
    currency: 'PKR',
    account: '2100-0120',
    terms: 'Net 30',
    outstanding: 0,
    status: 'Active',
    branch: 'Central Branch',
    invoiced: 0,
    paid: 0,
    unallocated: 0,
    bills: [],
  },
]

function money(value) {
  return value.toLocaleString('en-US')
}

function formatAsOf(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

const supplierColumns = [
  {
    key: 'name',
    label: 'Supplier / code',
    isRowHeader: true,
    renderCell: (item) => (
      <div>
        <p className="text-sm font-medium text-slate-800">{item.name}</p>
        <p className="text-xs text-slate-400">{item.id}</p>
      </div>
    ),
  },
  {
    key: 'contact',
    label: 'Contact / email',
    renderCell: (item) => (
      <div>
        <p className="text-sm text-slate-700">{item.contact}</p>
        <p className="text-xs text-slate-400">{item.phone}</p>
        <p className="text-xs text-slate-400">{item.email}</p>
      </div>
    ),
  },
  {
    key: 'address',
    label: 'Address',
    renderCell: (item) => <span className="text-sm text-slate-600">{item.address}</span>,
  },
  { key: 'currency', label: 'Currency' },
  { key: 'account', label: 'Payable account' },
  { key: 'terms', label: 'Terms' },
  {
    key: 'outstanding',
    label: 'Outstanding (PKR)',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => (
      <span className="text-sm text-slate-700">{money(item.outstanding)}</span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    renderCell: (item) => (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          item.status === 'Active'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        {item.status}
      </span>
    ),
  },
]

function SupplierPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [branch, setBranch] = useState('Central Branch')
  const [status, setStatus] = useState('All statuses')
  const [terms, setTerms] = useState('All payment terms')
  const [currency, setCurrency] = useState('PKR')
  const [asOf, setAsOf] = useState('2026-10-09')
  const [selectedId, setSelectedId] = useState('S-0042')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return suppliers.filter((supplier) => {
      const matchesQuery =
        !needle ||
        supplier.name.toLowerCase().includes(needle) ||
        supplier.id.toLowerCase().includes(needle) ||
        supplier.contact.toLowerCase().includes(needle) ||
        supplier.email.toLowerCase().includes(needle) ||
        supplier.phone.includes(needle)
      const matchesBranch = branch === 'All branches' || supplier.branch === branch
      const matchesStatus = status === 'All statuses' || supplier.status === status
      const matchesTerms = terms === 'All payment terms' || supplier.terms === terms
      const matchesCurrency = currency === 'All currencies' || supplier.currency === currency

      return matchesQuery && matchesBranch && matchesStatus && matchesTerms && matchesCurrency
    })
  }, [query, branch, status, terms, currency])

  const selected = filtered.find((supplier) => supplier.id === selectedId) || filtered[0] || null
  const directoryView =
    !query.trim() &&
    branch === 'Central Branch' &&
    status === 'All statuses' &&
    terms === 'All payment terms' &&
    currency === 'PKR'
  const outstandingTotal = directoryView
    ? 148600
    : filtered.reduce((sum, supplier) => sum + supplier.outstanding, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Directories
          </p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">
            Supplier
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage supplier contacts, payable accounts, and commercial terms in PKR.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton filename="suppliers" sheetName="Suppliers" columns={supplierColumns} rows={filtered} />
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
            className={`rounded-lg px-3 py-1.5 text-sm cursor-pointer ${
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
          value={`PKR ${money(outstandingTotal)}`}
          hint={`${filtered.length} suppliers`}
          hintClassName="text-emerald-600"
        />
        <StatCard
          label="Current"
          value={directoryView ? 'PKR 78,600' : `PKR ${money(outstandingTotal)}`}
          hint="within terms"
          hintClassName="text-emerald-600"
        />
        <StatCard
          label="1-30 days overdue"
          value={directoryView ? 'PKR 38,000' : 'PKR 0'}
          hint="due for payment"
          hintClassName="text-amber-500"
        />
        <StatCard
          label="Over 30 days"
          value={directoryView ? 'PKR 32,000' : 'PKR 0'}
          hint="priority"
          hintClassName="text-rose-500"
        />
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Supplier register</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              Contact, account mapping, and commercial terms.
            </p>
          </div>
          <p className="text-sm text-slate-400">{filtered.length} suppliers</p>
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
          <FilterSelect
            value={branch}
            onChange={setBranch}
            options={['All branches', 'Central Branch', 'North Branch']}
          />
          <FilterSelect
            value={status}
            onChange={setStatus}
            options={['All statuses', 'Active', 'Inactive']}
          />
          <FilterSelect
            value={terms}
            onChange={setTerms}
            options={['All payment terms', 'Cash', 'Net 7', 'Net 14', 'Net 30']}
          />
          <FilterSelect
            value={currency}
            onChange={setCurrency}
            options={['All currencies', 'PKR', 'USD']}
          />
          <input
            type="date"
            value={asOf}
            onChange={(event) => setAsOf(event.target.value)}
            aria-label="As of date"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          />
        </div>

        <GlobalTable
          ariaLabel="Supplier register"
          columns={supplierColumns}
          data={filtered}
          pagination
          rowsPerPage={8}
          // className="h-auto! max-h-none!"
          emptyContent="No suppliers match these filters."
          onRowPress={(item) => setSelectedId(item.id)}
          rowClassName={(item) =>
            `cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50 ${
              item.id === selectedId ? 'row-selected' : ''
            }`
          }
        />
        <p className="border-t border-slate-100 px-5 py-2 text-xs text-slate-400">
          Contact accounts stay separate.
        </p>
      </section>

      {selected && (
        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
          <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900">{selected.name}</h2>
                <p className="mt-0.5 text-xs text-slate-400">Selected supplier · {selected.id}</p>
              </div>
              <button
                type="button"
                onClick={() => toast.success(`Ledger opened for ${selected.name}.`)}
                className="text-sm font-medium whitespace-nowrap text-sky-600"
              >
                Open Supplier Ledger
              </button>
            </div>
            <dl className="mt-4 space-y-3">
              <DetailRow label="Supplier code" value={selected.id} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="Email" value={selected.companyEmail} />
              <DetailRow label="Address" value={selected.address} />
              <DetailRow label="Preferred currency" value={selected.currency} />
              <DetailRow label="Payment terms" value={selected.terms} />
              <DetailRow label="Payable account" value={selected.account} />
              <DetailRow label="Status">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    selected.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selected.status}
                </span>
              </DetailRow>
            </dl>
            <div className="mt-4 rounded-xl bg-[#eaf3ff] px-4 py-3">
              <p className="text-sm font-semibold text-[#2f6fed]">
                Payable balances come from posted entries
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Receivable and payable accounts stay separate. Supplier advances are shown
                separately from outstanding invoices.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900">Payables & posted activity</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {selected.name} · As of {formatAsOf(asOf)} · {selected.currency}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toast.success(`Payables opened for ${selected.name}.`)}
                className="text-sm font-medium whitespace-nowrap text-sky-600"
              >
                View Payables
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Outstanding" value={`PKR ${money(selected.outstanding)}`} />
              <MiniStat label="Current" value={`PKR ${money(selected.current ?? selected.outstanding)}`} />
              <MiniStat
                label="Overdue"
                value={`PKR ${money(selected.overdue ?? 0)}`}
                valueClassName="text-amber-500"
              />
              <MiniStat label="Unallocated advance" value={`PKR ${money(selected.unallocated)}`} />
            </div>
            {selected.nextDue && (
              <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                <p className="text-slate-500">Next due · {selected.nextDue.id}</p>
                <p className="font-medium text-slate-800">
                  {selected.nextDue.date} · PKR {money(selected.nextDue.amount)}
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
                  {selected.bills.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                        No posted bills for this supplier.
                      </td>
                    </tr>
                  ) : (
                    selected.bills.map((bill) => (
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
            {selected.allocation && (
              <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3">
                <p className="text-sm font-semibold text-emerald-700">
                  {selected.allocation.id} · PKR {money(selected.allocation.amount)} allocated
                </p>
                <p className="mt-1 text-sm text-slate-600">{selected.allocation.detail}</p>
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

function DetailRow({ label, value, children }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-800">{children || value}</dd>
    </div>
  )
}

export default SupplierPage
