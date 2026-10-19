import { useEffect, useState } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { useBranches } from '../../../queries/branches/branches.queries.js'

const limit = 20

const tabs = ['Branches', 'Shops', 'Warehouses', 'Employees', 'Owners', 'Relationships']

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

function display(value) {
  const text = String(value ?? '').trim()
  return text || '—'
}

function titleStatus(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'active') return 'Active'
  if (value === 'inactive') return 'Inactive'
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

function managerName(branch) {
  if (branch.manager?.name) return branch.manager.name
  if (branch.managerId && typeof branch.managerId === 'object' && branch.managerId.name) {
    return branch.managerId.name
  }
  return ''
}

function mapBranch(branch) {
  const manager = managerName(branch)

  return {
    id: branch._id,
    code: display(branch.code),
    name: display(branch.name),
    manager: manager || 'Unassigned',
    phone: display(branch.phone),
    location: display(branch.location),
    shops: branch.shopCount ?? '—',
    warehouses: branch.warehouseCount ?? '—',
    employees: '—',
    status: titleStatus(branch.status),
    address: display(branch.location),
    access: manager
      ? `${manager} is assigned to ${branch.name}. Warehouse and shop visibility use branch scope.`
      : 'No manager is assigned. Warehouse and shop visibility stay limited to this branch.',
    createdBy: '—',
    createdOn: formatDate(branch.createdAt),
    updatedOn: formatDate(branch.updatedAt),
    children: [],
  }
}

const statusClass = {
  Active: 'bg-[#e7f8ee] text-[#1f9d57]',
  Inactive: 'bg-slate-100 text-slate-500',
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClass[status]}`}>
      {status}
    </span>
  )
}

const branchColumns = [
  {
    key: 'code',
    label: 'CODE',
    renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.code}</span>,
  },
  {
    key: 'name',
    label: 'BRANCH',
    isRowHeader: true,
    renderCell: (item) => (
      <Link to={`/organization/branches/${item.id}`} className="text-[13px] font-medium text-slate-800 hover:text-[#2f6fed]">
        {item.name}
      </Link>
    ),
  },
  {
    key: 'manager',
    label: 'MANAGER',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.manager}</span>,
  },
  {
    key: 'location',
    label: 'LOCATION',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.location}</span>,
  },
  {
    key: 'shops',
    label: 'SHOPS',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-700">{item.shops}</span>,
  },
  {
    key: 'warehouses',
    label: 'WH',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-700">{item.warehouses}</span>,
  },
  {
    key: 'status',
    label: 'STATUS',
    renderCell: (item) => <StatusPill status={item.status} />,
  },
]

const childColumns = [
  {
    key: 'name',
    label: 'CHILD LOCATION',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.name}</span>,
  },
  {
    key: 'type',
    label: 'TYPE',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.type}</span>,
  },
  {
    key: 'code',
    label: 'CODE',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.code}</span>,
  },
  {
    key: 'status',
    label: 'STATUS',
    className: 'text-right',
    cellClassName: 'text-right',
    renderCell: (item) => <StatusPill status={item.status} />,
  },
]

function BranchPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('Branches')
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  const branchesQuery = useBranches({ page, limit, search: debouncedSearch, status })
  const summaryQuery = useBranches({ page: 1, limit, search: '', status: '' })
  const branches = (branchesQuery.data?.data || []).map(mapBranch)
  const total = branchesQuery.data?.meta?.total ?? branches.length
  const summary = branchesQuery.data?.meta?.summary ?? summaryQuery.data?.meta?.summary
  const selected = branches.find((branch) => branch.id === selectedId) || branches[0] || null
  const branchTotal = summary?.branches?.total ?? total
  const activeCount = summary?.branches?.active ?? 0
  const shopCount = summary?.shops?.total ?? 0
  const branchesWithShops = summary?.shops?.branchCount ?? 0
  const warehouseCount = summary?.warehouses?.total ?? 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Organization Branches</span>
          </nav>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Organization Workspace</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage branches and their shops, warehouses, teams, and ownership relationships.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toast.success('People and parties opened.')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            <Users size={15} />
            People & Parties
          </button>
          <button
            type="button"
            onClick={() => navigate('/organization/branches/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            <Plus size={15} />
            Add Branch
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
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
        <Stat label="Branches" value={branchTotal} hint={`${activeCount} active`} />
        <Stat label="Shops" value={shopCount} hint={`across ${branchesWithShops} branches`} />
        <Stat label="Warehouses" value={warehouseCount} hint={`${summary?.warehouses?.active ?? 0} active`} />
        <Stat label="Employees" value="—" hint="—" />
      </section>

      {tab === 'Branches' ? (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="px-5 pt-4">
                <h2 className="text-sm font-semibold text-slate-900">Branch register</h2>
                <p className="mt-0.5 text-xs text-slate-400">Branch is the highest operational level</p>
              </div>
              <div className="flex flex-col gap-2 px-5 py-3 lg:flex-row lg:items-center">
                <label className="relative min-w-0 flex-1">
                  <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search branch, code, manager"
                    className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
                  />
                </label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
                >
                  {statusOptions.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <GlobalTable
                ariaLabel="Branch register"
                columns={branchColumns}
                data={branches}
                pagination
                rowsPerPage={limit}
                page={page}
                totalCount={total}
                onPageChange={setPage}
                className="!h-auto !max-h-none"
                contentClassName="min-w-full"
                emptyContent={
                  branchesQuery.isError
                    ? branchesQuery.error.response?.data?.message || 'Could not load branches.'
                    : branchesQuery.isLoading
                      ? 'Loading branches...'
                      : 'No branches match these filters.'
                }
                summary={
                  total
                    ? `Showing ${branches.length === total ? 'all ' : ''}${total} ${total === 1 ? 'branch' : 'branches'
                    }${selected ? ' · 1 selected' : ''}`
                    : undefined
                }
                onRowPress={(branch) => setSelectedId(branch.id)}
                rowClassName={(branch) =>
                  selected?.id === branch.id ? 'row-soft' : 'hover:bg-slate-50'
                }
              />
            </section>

            <LocationHierarchy locations={selected?.children || []} />
          </div>

          {selected ? <BranchDetail branch={selected} /> : null}
        </div>
      ) : (
        <Directory tab={tab} />
      )}
    </div>
  )
}

function LocationHierarchy({ locations }) {
  const rows = locations.map((location) => ({ ...location, id: location.code }))

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e7eef6] bg-white shadow-sm">
      <div className="bg-[#eef4ff] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#2f6fed]">Location hierarchy</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">
          Each shop and warehouse belongs to one branch. Branch access determines the locations available to a user.
        </p>
      </div>
      <GlobalTable
        ariaLabel="Location hierarchy"
        columns={childColumns}
        data={rows}
        className="!h-auto !max-h-none"
        contentClassName="min-w-full"
        emptyContent="This branch has no shops or warehouses."
      />
    </section>
  )
}

function Stat({ label, value, hint }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</p>
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </article>
  )
}

function BranchDetail({ branch }) {
  return (
    <aside className="rounded-2xl border border-[#e7eef6] bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-slate-900">{branch.name}</h2>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={`/organization/branches/${branch.id}`}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700"
          >
            View
          </Link>
          <Link
            to={`/organization/branches/${branch.id}/edit`}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700"
          >
            Edit
          </Link>
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <p className="text-[12px] text-slate-400">{branch.code} · Branch details</p>
        <StatusPill status={branch.status} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
        <Detail label="Manager" value={branch.manager} />
        <Detail label="Phone" value={branch.phone} />
        <Detail label="Location" value={branch.location} />
        <Detail label="Warehouses" value={branch.warehouses} />
        <Detail label="Shops" value={branch.shops} />
        <Detail label="Employees" value={branch.employees} />
      </dl>
      <div className="mt-4">
        <p className="text-[12px] text-slate-400">Operating address</p>
        <p className="mt-1 text-[14px] font-medium text-slate-800">{branch.address}</p>
      </div>
      <div className="mt-4 rounded-xl bg-[#eef4ff] px-3.5 py-3">
        <p className="text-[13px] font-semibold text-[#2f6fed]">Manager access</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">{branch.access}</p>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <Detail label="Created by" value={branch.createdBy} />
        <Detail label="Created on" value={branch.createdOn} />
        <Detail label="Last updated" value={branch.updatedOn} />
      </dl>
    </aside>
  )
}

function Detail({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] text-slate-400">{label}</dt>
      <dd className="mt-1 text-[14px] font-medium text-slate-800">{value}</dd>
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

export default BranchPage
