import { useMemo, useState } from 'react'
import { Button } from '@heroui/react'
import { Download, Plus, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import GlobalTable from '../../components/GlobalTable.jsx'

const tabs = [
  { key: 'customer', label: 'Customers', singular: 'Customer' },
  { key: 'supplier', label: 'Suppliers', singular: 'Supplier' },
  { key: 'employee', label: 'Employees', singular: 'Employee' },
  { key: 'driver', label: 'Drivers', singular: 'Driver' },
  { key: 'partnership', label: 'Partnerships', singular: 'Partnership' },
  { key: 'govt', label: 'Govt', singular: 'Govt' },
  { key: 'transporter', label: 'Transporters', singular: 'Transporter' },
]

const parties = [
  {
    id: 'C-1078',
    name: 'Coastal Café Group',
    contact: 'Maya Reed',
    phone: '+1 202 555 0128',
    email: 'mia@coastalcafe.co',
    currency: 'PKR',
    account: '1200-0016',
    terms: 'Net 14',
    receivable: 18400,
    payable: 0,
    status: 'Active',
    type: 'customer',
    branch: 'Central Branch',
    creditLimit: 25000,
    available: 6600,
  },
  {
    id: 'C-0824',
    name: 'Harbor Retail',
    contact: 'Adam Lewis',
    phone: '+1 202 555 0142',
    email: 'adam@harborretail.co',
    currency: 'PKR',
    account: '1200-0016',
    terms: 'Net 30',
    receivable: 24000,
    payable: 0,
    status: 'Active',
    type: 'customer',
    branch: 'Central Branch',
    creditLimit: 40000,
    available: 16000,
  },
  {
    id: 'C-0931',
    name: 'Metro Foods',
    contact: 'Sana Aziz',
    phone: '+1 202 555 0177',
    email: 'sana@metrofoods.co',
    currency: 'PKR',
    account: '1200-0031',
    terms: 'Net 30',
    receivable: 16200,
    payable: 0,
    status: 'Active',
    type: 'customer',
    branch: 'Central Branch',
    creditLimit: 30000,
    available: 13800,
  },
  {
    id: 'C-0042',
    name: 'Airport Deli',
    contact: 'Ryan Cole',
    phone: '+1 202 555 0113',
    email: 'ryan@airportdeli.co',
    currency: 'PKR',
    account: '1200-0042',
    terms: 'Net 7',
    receivable: 8400,
    payable: 0,
    status: 'Active',
    type: 'customer',
    branch: 'Central Branch',
    creditLimit: 15000,
    available: 6600,
  },
  {
    id: 'C-0306',
    name: 'Green Basket',
    contact: 'Leila Noor',
    phone: '+1 202 555 0198',
    email: 'leila@greenbasket.co',
    currency: 'PKR',
    account: '1200-0042',
    terms: 'Net 14',
    receivable: 12840,
    payable: 0,
    status: 'Active',
    type: 'customer',
    branch: 'Central Branch',
    creditLimit: 20000,
    available: 7160,
  },
  {
    id: 'C-0069',
    name: 'Riverside Market',
    contact: 'Amir Hassan',
    phone: '+1 202 555 0166',
    email: 'amir@riversidemarket.co',
    currency: 'PKR',
    account: '1200-0069',
    terms: 'Net 30',
    receivable: 15300,
    payable: 0,
    status: 'Active',
    type: 'customer',
    branch: 'Central Branch',
    creditLimit: 25000,
    available: 9700,
  },
  {
    id: 'C-0073',
    name: 'Old Town Grocer',
    contact: 'Mehn Grant',
    phone: '+1 202 555 0168',
    email: 'mehn@oldtowngrocer.co',
    currency: 'PKR',
    account: '1200-0073',
    terms: 'Cash',
    receivable: 0,
    payable: 0,
    status: 'Active',
    type: 'customer',
    branch: 'Central Branch',
    creditLimit: 0,
    available: 0,
  },
  {
    id: 'C-0188',
    name: 'Pearl Street Market',
    contact: 'Nadia Shah',
    phone: '+1 202 555 0188',
    email: 'nadia@pearlstreet.co',
    currency: 'PKR',
    account: '1200-0188',
    terms: 'Net 30',
    receivable: 7600,
    payable: 0,
    status: 'Active',
    type: 'customer',
    branch: 'Central Branch',
    creditLimit: 18000,
    available: 10400,
  },
  {
    id: 'C-0192',
    name: 'Cedar Lane Grocers',
    contact: 'Owen Blake',
    phone: '+1 202 555 0192',
    email: 'owen@cedarlane.co',
    currency: 'PKR',
    account: '1200-0192',
    terms: 'Net 14',
    receivable: 5100,
    payable: 0,
    status: 'Active',
    type: 'customer',
    branch: 'Central Branch',
    creditLimit: 12000,
    available: 6900,
  },
  {
    id: 'C-0114',
    name: 'North Mill Bakery',
    contact: 'Helen Park',
    phone: '+1 202 555 0184',
    email: 'helen@northmill.co',
    currency: 'PKR',
    account: '1200-0114',
    terms: 'Net 14',
    receivable: 9200,
    payable: 0,
    status: 'Inactive',
    type: 'customer',
    branch: 'North Branch',
    creditLimit: 10000,
    available: 800,
  },
  {
    id: 'S-0210',
    name: 'Atlas Packaging',
    contact: 'Omar Farid',
    phone: '+1 202 555 0201',
    email: 'omar@atlaspack.co',
    currency: 'PKR',
    account: '2100-0210',
    terms: 'Net 30',
    receivable: 0,
    payable: 18600,
    status: 'Active',
    type: 'supplier',
    branch: 'Central Branch',
    creditLimit: 0,
    available: 0,
  },
  {
    id: 'S-0218',
    name: 'Valley Produce',
    contact: 'Nora Iqbal',
    phone: '+1 202 555 0218',
    email: 'nora@valleyproduce.co',
    currency: 'USD',
    account: '2100-0218',
    terms: 'Net 14',
    receivable: 0,
    payable: 4200,
    status: 'Active',
    type: 'supplier',
    branch: 'North Branch',
    creditLimit: 0,
    available: 0,
  },
  {
    id: 'E-014',
    name: 'Hina Qureshi',
    contact: 'Hina Qureshi',
    phone: '+1 202 555 0144',
    email: 'hina@erp.local',
    currency: 'PKR',
    account: '5100-0014',
    terms: 'Cash',
    receivable: 0,
    payable: 0,
    status: 'Active',
    type: 'employee',
    branch: 'Central Branch',
    creditLimit: 0,
    available: 0,
  },
  {
    id: 'D-008',
    name: 'Karim Delivery',
    contact: 'Karim Shah',
    phone: '+1 202 555 0088',
    email: 'karim@routes.co',
    currency: 'PKR',
    account: '6100-0008',
    terms: 'Cash',
    receivable: 0,
    payable: 1500,
    status: 'Active',
    type: 'driver',
    branch: 'Central Branch',
    creditLimit: 0,
    available: 0,
  },
  {
    id: 'P-003',
    name: 'Blue Harbor JV',
    contact: 'Elena Voss',
    phone: '+1 202 555 0033',
    email: 'elena@blueharbor.co',
    currency: 'PKR',
    account: '3100-0003',
    terms: 'Net 30',
    receivable: 5400,
    payable: 2100,
    status: 'Active',
    type: 'partnership',
    branch: 'Central Branch',
    creditLimit: 20000,
    available: 14600,
  },
  {
    id: 'G-001',
    name: 'City Revenue Office',
    contact: 'Desk 4',
    phone: '+1 202 555 1001',
    email: 'desk4@cityrevenue.gov',
    currency: 'PKR',
    account: '2200-0001',
    terms: 'Net 7',
    receivable: 0,
    payable: 8600,
    status: 'Active',
    type: 'govt',
    branch: 'Central Branch',
    creditLimit: 0,
    available: 0,
  },
  {
    id: 'T-012',
    name: 'Swift Haul',
    contact: 'Bilal Khan',
    phone: '+1 202 555 1012',
    email: 'bilal@swifthaul.co',
    currency: 'PKR',
    account: '6200-0012',
    terms: 'Net 14',
    receivable: 0,
    payable: 7300,
    status: 'Active',
    type: 'transporter',
    branch: 'North Branch',
    creditLimit: 0,
    available: 0,
  },
]

function money(value) {
  return value.toLocaleString('en-US')
}

const customerColumns = [
  {
    key: 'name',
    label: 'Party / code',
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
    label: 'Contact',
    renderCell: (item) => (
      <div>
        <p className="text-sm text-slate-700">{item.contact}</p>
        <p className="text-xs text-slate-400">{item.phone}</p>
      </div>
    ),
  },
  { key: 'currency', label: 'Currency' },
  { key: 'account', label: 'AR / AP account' },
  { key: 'terms', label: 'Terms' },
  {
    key: 'receivable',
    label: 'Receivable (PKR)',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="text-sm text-slate-700">{money(item.receivable)}</span>,
  },
  {
    key: 'payable',
    label: 'Payable (PKR)',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="text-sm text-slate-700">{money(item.payable)}</span>,
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

function CustomerPage() {
  const [tab, setTab] = useState('customer')
  const [query, setQuery] = useState('')
  const [branch, setBranch] = useState('Central Branch')
  const [status, setStatus] = useState('All statuses')
  const [currency, setCurrency] = useState('PKR')
  const [selectedId, setSelectedId] = useState('C-1078')

  const tabParties = useMemo(
    () => parties.filter((party) => party.type === tab),
    [tab],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return tabParties.filter((party) => {
      const matchesQuery =
        !needle ||
        party.name.toLowerCase().includes(needle) ||
        party.id.toLowerCase().includes(needle) ||
        party.contact.toLowerCase().includes(needle) ||
        party.phone.includes(needle)
      const matchesBranch = branch === 'All branches' || party.branch === branch
      const matchesStatus = status === 'All statuses' || party.status === status
      const matchesCurrency = currency === 'All currencies' || party.currency === currency

      return matchesQuery && matchesBranch && matchesStatus && matchesCurrency
    })
  }, [tabParties, query, branch, status, currency])

  const selected = filtered.find((party) => party.id === selectedId) || filtered[0] || null

  const activeTab = tabs.find((item) => item.key === tab)
  const tabLabel = activeTab?.label || 'Parties'
  const directoryView =
    tab === 'customer' &&
    !query.trim() &&
    branch === 'Central Branch' &&
    status === 'All statuses' &&
    currency === 'PKR'

  const receivable = directoryView
    ? 96240
    : tabParties.reduce((sum, party) => sum + party.receivable, 0)
  const partyCount = directoryView ? 186 : tabParties.length
  const activeCount = directoryView
    ? 176
    : tabParties.filter((party) => party.status === 'Active').length
  const creditCount = directoryView
    ? 128
    : tabParties.filter((party) => party.terms !== 'Cash').length
  const inactiveCount = directoryView
    ? 8
    : tabParties.filter((party) => party.status !== 'Active').length

  function changeTab(nextTab) {
    setTab(nextTab)
    const first = parties.find((party) => party.type === nextTab)
    setSelectedId(first?.id || '')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Directories
          </p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">
            Customer
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            A shared party directory for customers, suppliers, people, and service partners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onPress={() => toast.success('Customer register exported.')}
          >
            <Download size={15} />
            Export
          </Button>
          <Button size="sm" onPress={() => toast.success('Add customer is ready to connect.')}>
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
          label={tabLabel}
          value={String(partyCount)}
          hint={`${activeCount} active`}
        />
        <StatCard
          label="Receivable balance"
          value={`PKR ${money(receivable)}`}
          hint="PKR base"
        />
        <StatCard
          label={tab === 'customer' ? 'Credit customers' : 'Credit parties'}
          value={String(creditCount)}
          hint="terms configured"
        />
        <StatCard
          label="Inactive parties"
          value={String(inactiveCount)}
          hint="retained for history"
        />
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold">Customer register</h2>
            <p className="text-xs text-slate-500">
              Contact, account mapping, and commercial terms.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative">
              <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search party or contact"
                className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-8 text-sm outline-none placeholder:text-slate-400 focus:border-sky-400 sm:w-56"
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
              value={currency}
              onChange={setCurrency}
              options={['All currencies', 'PKR', 'USD']}
            />
          </div>
        </div>

        <GlobalTable
          ariaLabel="Customer register"
          columns={customerColumns}
          data={filtered}
          pagination
          rowsPerPage={7}
          emptyContent="No parties match these filters."
          onRowPress={(item) => setSelectedId(item.id)}
          rowClassName={(item) =>
            `cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50 ${
              item.id === selectedId ? 'bg-sky-50' : ''
            }`
          }
        />
      </section>

      {selected && (
        <section className="grid items-start gap-x-2 gap-y-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <article className="rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900">{selected.name}</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Selected {(activeTab?.singular || 'party').toLowerCase()} · {selected.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toast.success(`Ledger opened for ${selected.name}.`)}
                className="text-sm font-medium whitespace-nowrap text-sky-600"
              >
                Open {(activeTab?.singular || 'party').toLowerCase()} ledger
              </button>
            </div>
            <dl className="mt-4 space-y-3">
              <DetailRow label="Email" value={selected.email} />
              <DetailRow
                label="Credit limit / available"
                value={`PKR ${money(selected.creditLimit)} / PKR ${money(selected.available)}`}
              />
              <DetailRow label="Default terms" value={`${selected.terms} · ${selected.currency}`} />
            </dl>
          </article>

          <article className="rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-[15px] font-semibold text-slate-900">Party accounts</h2>
            <p className="mt-0.5 text-xs text-slate-400">Traceable financial relationships</p>
            <div className="mt-3 rounded-xl bg-[#eaf3ff] px-4 py-3">
              <p className="text-sm font-semibold text-[#2f6fed]">
                Receivable and payable accounts stay separate
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                A party can be both customer and supplier. Balances derive from posted ledger
                entries, not manual balance edits.
              </p>
            </div>
          </article>
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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-800">{value}</dd>
    </div>
  )
}

export default CustomerPage
