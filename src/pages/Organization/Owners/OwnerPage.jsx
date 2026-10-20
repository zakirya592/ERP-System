import { useState } from 'react'
import { Download, Plus, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import GlobalTable from '../../../components/GlobalTable.jsx'
import {
  formatMoney,
  formatPercent,
  formatPledged,
  mergeOwnerRegister,
  ownerAccess,
  ownerSummary,
  parseMoney,
  parseShare,
  useAddedOwners,
  useOwnerOverrides,
} from './ownerRecords.js'

const pageSize = 5

const tabs = ['Branches', 'Shops', 'Warehouses', 'Employees', 'Owners', 'Partnerships']

const tabRoutes = {
  Branches: '/organization/branches',
  Shops: '/organization/shop',
  Warehouses: '/organization/warehouses',
  Employees: '/organization/employees',
}

export const owners = [
  {
    id: 'OWN-001',
    code: 'OWN-001',
    name: 'Amina Rahman',
    type: 'Individual',
    identity: '42101-1234567-1',
    email: 'amina@example.com',
    phone: '',
    address: 'City Center',
    country: 'Pakistan',
    share: '60%',
    capitalCommitment: 'PKR 6,000,000',
    effectiveDate: 'Jan 01, 2026',
    capitalAccount: 'Owner capital — Amina',
    signatory: 'Amina Rahman',
    status: 'Active',
    branch: 'Central Branch',
    documentType: 'Identity / registration',
    documentReference: 'DOC-OWN-001',
    fileName: 'agreement-or-record.pdf',
    notes: '',
    createdBy: 'Amina Rahman',
    createdOn: 'Jan 01, 2026',
    updatedOn: 'Sep 20, 2026',
    summary: ownerSummary,
    access: ownerAccess,
    interests: [
      {
        id: 'OWN-001-interest',
        entity: 'Central Trading',
        share: '60%',
        committed: 'PKR 6,000,000',
        paidIn: 'PKR 4,500,000',
        effectiveDate: 'Jan 01, 2026',
      },
    ],
  },
  {
    id: 'OWN-002',
    code: 'OWN-002',
    name: 'Khalid Trading Ltd',
    type: 'Corporate',
    identity: 'REG-88421',
    email: 'accounts@khalidtrading.com',
    phone: '',
    address: 'North District',
    country: 'Pakistan',
    share: '40%',
    capitalCommitment: 'PKR 4,000,000',
    effectiveDate: 'Jan 01, 2026',
    capitalAccount: 'Owner capital — Khalid',
    signatory: 'Imran Khalid',
    status: 'Active',
    branch: 'Central Branch',
    documentType: 'Identity / registration',
    documentReference: 'DOC-OWN-002',
    fileName: '',
    notes: '',
    createdBy: 'Amina Rahman',
    createdOn: 'Feb 12, 2026',
    updatedOn: 'Sep 18, 2026',
    summary: ownerSummary,
    access: ownerAccess,
    interests: [
      {
        id: 'OWN-002-interest',
        entity: 'Central Trading',
        share: '40%',
        committed: 'PKR 4,000,000',
        paidIn: 'PKR 3,000,000',
        effectiveDate: 'Jan 01, 2026',
      },
    ],
  },
]

const statusClass = {
  Active: 'bg-[#e7f8ee] text-[#1f9d57]',
  Inactive: 'bg-[#eef1f4] text-[#8b95a5]',
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClass[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  )
}

function ownerColumns(onView, onEdit) {
  return [
    {
      key: 'code',
      label: 'CODE',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.code}</span>,
    },
    {
      key: 'name',
      label: 'OWNER',
      isRowHeader: true,
      renderCell: (item) => (
        <button type="button" onClick={() => onView(item)} className="text-[13px] font-medium text-slate-800">
          {item.name}
        </button>
      ),
    },
    {
      key: 'type',
      label: 'TYPE',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{item.type}</span>,
    },
    {
      key: 'share',
      label: 'OWNERSHIP',
      renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.share}</span>,
    },
    {
      key: 'status',
      label: 'STATUS',
      renderCell: (item) => <StatusPill status={item.status} />,
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      className: 'text-right',
      cellClassName: 'text-right',
      renderCell: (item) => (
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => onView(item)} className="text-[13px] font-medium text-[#2f6fed]">
            View
          </button>
          <button type="button" onClick={() => onEdit(item)} className="text-[13px] font-medium text-[#2f6fed]">
            Edit
          </button>
        </div>
      ),
    },
  ]
}

const interestColumns = [
  {
    key: 'entity',
    label: 'ENTITY',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.entity}</span>,
  },
  {
    key: 'share',
    label: 'SHARE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.share}</span>,
  },
  {
    key: 'committed',
    label: 'COMMITTED',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.committed}</span>,
  },
  {
    key: 'paidIn',
    label: 'PAID IN',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.paidIn}</span>,
  },
  {
    key: 'effectiveDate',
    label: 'EFFECTIVE DATE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.effectiveDate}</span>,
  },
]

function totalInterest(register) {
  const interests = register.flatMap((owner) => owner.interests || [])
  const share = register.reduce((total, owner) => total + parseShare(owner.share), 0)
  const committed = interests.reduce((total, item) => total + parseMoney(item.committed), 0)
  const paidIn = interests.reduce((total, item) => total + parseMoney(item.paidIn), 0)
  return {
    id: 'total-allocated',
    entity: 'Total allocated',
    share: formatPercent(share),
    committed: formatMoney(committed),
    paidIn: formatMoney(paidIn),
    effectiveDate: 'Current',
  }
}

function OwnerPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const addedOwners = useAddedOwners()
  const overrides = useOwnerOverrides()
  const register = mergeOwnerRegister(addedOwners, owners, overrides)
  const [tab, setTab] = useState('Owners')
  const [query, setQuery] = useState('')
  const [branch, setBranch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || owners[0].id)
  const [interestId, setInterestId] = useState(owners[0].interests[0].id)

  const branches = [...new Set(register.map((owner) => owner.branch).filter(Boolean))]
  const needle = query.trim().toLowerCase()
  const filtered = register.filter((owner) => {
    const matchesQuery = !needle || owner.name.toLowerCase().includes(needle) || owner.code.toLowerCase().includes(needle)
    const matchesBranch = !branch || owner.branch === branch
    const matchesStatus = !status || owner.status === status
    return matchesQuery && matchesBranch && matchesStatus
  })
  const start = (page - 1) * pageSize
  const pageRows = filtered.slice(start, start + pageSize)
  const selected = pageRows.find((owner) => owner.id === selectedId) || pageRows[0] || null
  const interests = selected ? [...(selected.interests || []), totalInterest(register)] : []
  const selectedInterest = interests.find((item) => item.id === interestId) || interests[0] || null
  const activeCount = register.filter((owner) => owner.status === 'Active').length
  const shareTotal = register.reduce((total, owner) => total + parseShare(owner.share), 0)
  const pledged = register.reduce((total, owner) => total + parseMoney(owner.capitalCommitment), 0)

  function openTab(item) {
    const route = tabRoutes[item]
    if (route) {
      navigate(route)
      return
    }
    setTab(item)
  }

  function selectOwner(owner) {
    setSelectedId(owner.id)
    setInterestId(owner.interests[0]?.id || null)
  }

  function viewOwner(owner) {
    navigate(`/organization/owners/${owner.id}`)
  }

  function editOwner(owner) {
    navigate(`/organization/owners/${owner.id}/edit`)
  }

  function clearFilters() {
    setQuery('')
    setBranch('')
    setStatus('')
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <Link to="/dashboard" className="hover:text-slate-700">
              Organization
            </Link>
            <span>/</span>
            <span className="text-slate-700">Owners</span>
            <span>/</span>
            <span>Register</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Owners</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Maintain owner identities, ownership interests, capital records and authorized signatories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toast.success('Owner register exported.')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            <Download size={15} />
            Export
          </button>
          <button
            type="button"
            onClick={() => navigate('/organization/owners/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            <Plus size={15} />
            Add Owner
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => openTab(item)}
            className={
              tab === item
                ? 'rounded-lg bg-[#e8f1ff] px-3 py-1.5 text-sm font-medium text-[#2f6fed]'
                : 'rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-white'
            }
          >
            {item}
          </button>
        ))}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Owners" value={register.length} />
        <Stat label="Active" value={activeCount} />
        <Stat label="Ownership allocated" value={formatPercent(shareTotal)} />
        <Stat label="Capital pledged" value={formatPledged(pledged)} />
      </section>

      {tab === 'Owners' ? (
        <>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Search name or code"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
              />
            </label>
            <select
              aria-label="Branch"
              value={branch}
              onChange={(event) => {
                setBranch(event.target.value)
                setPage(1)
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              <option value="">All branches</option>
              {branches.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              aria-label="Status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
                setPage(1)
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button type="button" onClick={clearFilters} className="px-2 py-2 text-sm font-medium text-[#2f6fed] lg:ml-auto">
              Clear filters
            </button>
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="px-5 pt-4">
                  <h2 className="text-sm font-semibold text-slate-900">Owners register</h2>
                </div>
                <GlobalTable
                  ariaLabel="Owners register"
                  columns={ownerColumns(viewOwner, editOwner)}
                  data={pageRows}
                  pagination
                  rowsPerPage={pageSize}
                  page={page}
                  totalCount={filtered.length}
                  onPageChange={setPage}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent="No owners match these filters."
                  summary={
                    filtered.length
                      ? `Showing ${pageRows.length} ${pageRows.length === 1 ? 'record' : 'records'}${selected ? ' · 1 selected' : ''}`
                      : undefined
                  }
                  onRowPress={selectOwner}
                  rowClassName={(owner) => (selected?.id === owner.id ? 'row-soft' : 'hover:bg-slate-50')}
                />
              </section>

              <section className="rounded-2xl border border-[#d7e6ff] bg-[#eef4ff] px-5 py-4">
                <h2 className="text-sm font-semibold text-[#2f6fed]">Organization rules</h2>
                <p className="mt-1 text-[13px] leading-5 text-slate-500">{ownerSummary}</p>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="px-5 pt-4">
                  <h2 className="text-sm font-semibold text-slate-900">Ownership and capital interests</h2>
                </div>
                <GlobalTable
                  ariaLabel="Ownership and capital interests"
                  columns={interestColumns}
                  data={interests}
                  pagination
                  rowsPerPage={pageSize}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent={selected ? 'This owner has no capital interests.' : 'Select an owner to see capital interests.'}
                  summary={
                    interests.length
                      ? `Showing ${interests.length} ${interests.length === 1 ? 'record' : 'records'}${selectedInterest ? ' · 1 selected' : ''}`
                      : undefined
                  }
                  onRowPress={(interest) => setInterestId(interest.id)}
                  rowClassName={(interest) => (selectedInterest?.id === interest.id ? 'row-soft' : 'hover:bg-slate-50')}
                />
              </section>
            </div>

            {selected ? <OwnerDetail owner={selected} /> : null}
          </div>
        </>
      ) : (
        <Directory tab={tab} />
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
    </article>
  )
}

function OwnerDetail({ owner }) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-4">
      <h2 className="text-[18px] font-semibold text-slate-900">{owner.name}</h2>
      <p className="mt-1 text-[13px] text-slate-400">{owner.code}</p>
      <div className="mt-3">
        <StatusPill status={owner.status} />
      </div>
      <p className="mt-4 text-[13px] leading-5 text-slate-500">{owner.summary}</p>
      <dl className="mt-5 space-y-3.5">
        <Fact label="Created by" value={owner.createdBy} />
        <Fact label="Created on" value={owner.createdOn} />
        <Fact label="Updated" value={owner.updatedOn} />
        <Fact label="Record status" value={owner.status} />
      </dl>
      <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
        <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">{owner.access}</p>
      </div>
    </aside>
  )
}

function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-[13px] text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-[14px] font-medium text-slate-800">{value}</dd>
    </div>
  )
}

function Directory({ tab }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{tab}</h2>
      <p className="mt-1 text-sm text-slate-400">Nothing is configured in this view yet.</p>
    </section>
  )
}

export default OwnerPage
