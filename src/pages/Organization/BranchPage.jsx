import { useMemo, useState } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import GlobalTable from '../../components/GlobalTable.jsx'

const tabs = ['Branches', 'Shops', 'Warehouses', 'Employees', 'Owners', 'Relationships']

const branches = [
  {
    id: 'BR-CEN',
    name: 'Central Branch',
    manager: 'Omar Khalid',
    phone: '+1 202 555 0146',
    location: 'City Center',
    shops: 3,
    warehouses: 2,
    employees: 22,
    status: 'Active',
    address: '18 Commerce Avenue, City Center, 10012',
    access: 'Omar has operational approval access to Central Branch. Warehouse posting remains role restricted.',
    createdBy: 'Amna Rahman',
    createdOn: 'Jan 01, 2026',
    updatedOn: 'Sep 29, 2026',
    children: [
      { name: 'Main Warehouse', type: 'Warehouse', code: 'WH-001', status: 'Active' },
      { name: 'Reserve Warehouse', type: 'Warehouse', code: 'WH-002', status: 'Active' },
      { name: 'Central Shop', type: 'Shop', code: 'SH-001', status: 'Active' },
      { name: 'Market Shop', type: 'Shop', code: 'SH-002', status: 'Active' },
      { name: 'Riverside Shop', type: 'Shop', code: 'SH-003', status: 'Active' },
    ],
  },
  {
    id: 'BR-NTH',
    name: 'North Branch',
    manager: 'Nadia Saleh',
    phone: '+1 202 555 0190',
    location: 'North District',
    shops: 3,
    warehouses: 2,
    employees: 14,
    status: 'Active',
    address: '42 North Market Road, North District, 10018',
    access: 'Nadia has operational sign-in access for North Branch. Warehouse and shop visibility use branch scope.',
    createdBy: 'Amna Rehman',
    createdOn: 'Feb 12, 2026',
    updatedOn: 'Aug 14, 2026',
    children: [
      { name: 'North Warehouse', type: 'Warehouse', code: 'WH-011', status: 'Active' },
      { name: 'North Shop', type: 'Shop', code: 'SH-011', status: 'Active' },
      { name: 'Harbor Shop', type: 'Shop', code: 'SH-012', status: 'Active' },
    ],
  },
  {
    id: 'BR-AIR',
    name: 'Airport Branch',
    manager: 'Lina Abbas',
    phone: '+1 202 555 0164',
    location: 'Airport Road',
    shops: 2,
    warehouses: 1,
    employees: 9,
    status: 'Active',
    address: '9 Airport Road, Terminal District, 10022',
    access: 'Lina has operational sign-in access for Airport Branch. Warehouse and shop visibility use branch scope.',
    createdBy: 'Amna Rehman',
    createdOn: 'Mar 03, 2026',
    updatedOn: 'Sep 02, 2026',
    children: [
      { name: 'Airport Warehouse', type: 'Warehouse', code: 'WH-021', status: 'Active' },
      { name: 'Terminal Shop', type: 'Shop', code: 'SH-021', status: 'Active' },
      { name: 'Departure Shop', type: 'Shop', code: 'SH-022', status: 'Active' },
    ],
  },
  {
    id: 'BR-WST',
    name: 'West Branch',
    manager: 'Unassigned',
    phone: '—',
    location: 'West District',
    shops: 0,
    warehouses: 0,
    employees: 0,
    status: 'Inactive',
    address: '7 West Avenue, West District, 10030',
    access: 'No manager is assigned. Warehouse and shop visibility stay limited to this branch.',
    createdBy: 'Amna Rehman',
    createdOn: 'Apr 18, 2026',
    updatedOn: 'Jul 21, 2026',
    children: [],
  },
]

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
    key: 'id',
    label: 'CODE',
    renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.id}</span>,
  },
  {
    key: 'name',
    label: 'BRANCH',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.name}</span>,
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

const directoryColumns = [
  {
    key: 'name',
    label: 'NAME',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.name}</span>,
  },
  {
    key: 'branch',
    label: 'BRANCH',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.branch}</span>,
  },
  {
    key: 'code',
    label: 'CODE',
    renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.code}</span>,
  },
  {
    key: 'status',
    label: 'STATUS',
    renderCell: (item) => <StatusPill status={item.status} />,
  },
]

function BranchPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('Branches')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [selectedId, setSelectedId] = useState(branches[0].id)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return branches.filter((branch) => {
      const matchesQuery =
        !needle ||
        branch.name.toLowerCase().includes(needle) ||
        branch.id.toLowerCase().includes(needle) ||
        branch.manager.toLowerCase().includes(needle)
      const matchesStatus = status === 'All statuses' || branch.status === status
      return matchesQuery && matchesStatus
    })
  }, [query, status])

  const selected = filtered.find((branch) => branch.id === selectedId) || filtered[0] || null
  const activeCount = branches.filter((branch) => branch.status === 'Active').length
  const shopCount = branches.reduce((sum, branch) => sum + branch.shops, 0)
  const warehouseCount = branches.reduce((sum, branch) => sum + branch.warehouses, 0)
  const branchesWithShops = branches.filter((branch) => branch.shops > 0 && branch.status === 'Active').length

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
        <Stat label="Branches" value={branches.length} hint={`${activeCount} active`} />
        <Stat label="Shops" value={shopCount} hint={`across ${branchesWithShops} branches`} />
        <Stat label="Warehouses" value={warehouseCount} hint="branch-owned" />
        <Stat label="Employees" value="46" hint="42 active" />
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
                  <option>All statuses</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <GlobalTable
                ariaLabel="Branch register"
                columns={branchColumns}
                data={filtered}
                pagination
                rowsPerPage={8}
                className="!h-auto !max-h-none"
                contentClassName="min-w-full"
                emptyContent="No branches match these filters."
                summary={
                  filtered.length
                    ? `Showing ${filtered.length === branches.length ? 'all ' : ''}${filtered.length} ${
                        filtered.length === 1 ? 'branch' : 'branches'
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
        <button
          type="button"
          onClick={() => toast.success(`${branch.name} is ready to edit.`)}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700"
        >
          Edit branch
        </button>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <p className="text-[12px] text-slate-400">{branch.id} · Branch details</p>
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
  const rows =
    tab === 'Shops' || tab === 'Warehouses'
      ? branches.flatMap((branch) =>
          branch.children
            .filter((child) => child.type === (tab === 'Shops' ? 'Shop' : 'Warehouse'))
            .map((child) => ({ ...child, id: child.code, branch: branch.name })),
        )
      : []

  if (!rows.length) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">{tab}</h2>
        <p className="mt-1 text-sm text-slate-400">Nothing is configured in this view yet.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{tab}</h2>
      <p className="mt-0.5 text-xs text-slate-400">{rows.length} records across the branches</p>
      <GlobalTable
        ariaLabel={tab}
        columns={directoryColumns}
        data={rows}
        pagination
        rowsPerPage={8}
        className="!h-auto max-h-none!"
        emptyContent={`No ${tab.toLowerCase()} are configured.`}
      />
    </section>
  )
}

export default BranchPage
