import { useState } from 'react'
import { Download, Plus, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { mergeShopRegister, useAddedShops, useShopOverrides } from './shopRecords.js'

const pageSize = 5

const tabs = ['Branches', 'Shops', 'Warehouses', 'Employees', 'Owners', 'Partnerships']

export const shops = [
  {
    id: 'SH-001',
    code: 'SH-001',
    name: 'Central Shop',
    branch: 'Central Branch',
    manager: 'Omar Khalid',
    status: 'Active',
    type: 'Retail outlet',
    address: '18 Commerce Avenue',
    city: 'City Center',
    phone: 'Enter shop phone',
    email: 'shop@example.com',
    warehouse: 'Main Warehouse',
    priceList: 'Standard retail',
    cashAccount: 'Central shop cash',
    openingHours: '09:00–18:00',
    documentType: 'Shop lease / registration',
    documentReference: 'DOC-2026-001',
    fileName: 'agreement-or-record.pdf',
    notes: '',
    createdBy: 'Anika Rahman',
    createdOn: 'Jan 01, 2026',
    updatedOn: 'Sep 20, 2026',
    summary:
      'Select the branch before choosing a linked warehouse. Only warehouses in that branch are available.',
    access: "Sales default to this shop's warehouse and price list. Cash follows the assigned role.",
    employees: [
      { id: 'SH-001-EMP-001', code: 'EMP-001', name: 'Omar Khalid', role: 'Shop manager', assignment: 'Primary', status: 'Active' },
      { id: 'SH-001-EMP-004', code: 'EMP-004', name: 'Sara Khan', role: 'Sales officer', assignment: 'Primary', status: 'Active' },
      { id: 'SH-001-EMP-005', code: 'EMP-005', name: 'Ali Hassan', role: 'Cashier', assignment: 'Secondary', status: 'Active' },
    ],
  },
  {
    id: 'SH-002',
    code: 'SH-002',
    name: 'Market Shop',
    branch: 'Central Branch',
    manager: 'Lina Abbas',
    status: 'Active',
    createdBy: 'Anika Rahman',
    createdOn: 'Feb 12, 2026',
    updatedOn: 'Sep 18, 2026',
    summary: 'Retail counter for the central market. Price list and cash drawer follow the shop assignment.',
    access: 'Sales post against the market warehouse. Returns stay inside this shop.',
    employees: [
      { id: 'SH-002-EMP-006', code: 'EMP-006', name: 'Lina Abbas', role: 'Sales officer', assignment: 'Primary', status: 'Active' },
      { id: 'SH-002-EMP-007', code: 'EMP-007', name: 'Nadia Islam', role: 'Cashier', assignment: 'Secondary', status: 'Active' },
      { id: 'SH-002-EMP-008', code: 'EMP-008', name: 'Reza Ahmed', role: 'Store keeper', assignment: 'Primary', status: 'Active' },
    ],
  },
  {
    id: 'SH-003',
    code: 'SH-003',
    name: 'Riverside Shop',
    branch: 'Central Branch',
    manager: 'Sara Khan',
    status: 'Active',
    createdBy: 'Imran Qureshi',
    createdOn: 'Mar 04, 2026',
    updatedOn: 'Aug 30, 2026',
    summary: 'Walk-in shop linked to the central branch warehouse. Stock requests use that warehouse only.',
    access: 'Counters use the riverside price list. Cash is closed by the primary cashier.',
    employees: [
      { id: 'SH-003-EMP-004', code: 'EMP-004', name: 'Sara Khan', role: 'Sales officer', assignment: 'Primary', status: 'Active' },
      { id: 'SH-003-EMP-001', code: 'EMP-001', name: 'Omar Khalid', role: 'Shop manager', assignment: 'Secondary', status: 'Active' },
    ],
  },
  {
    id: 'SH-004',
    code: 'SH-004',
    name: 'North Shop',
    branch: 'North Branch',
    manager: 'Nadia Islam',
    status: 'Active',
    createdBy: 'Anika Rahman',
    createdOn: 'Apr 16, 2026',
    updatedOn: 'Sep 02, 2026',
    summary: 'North branch retail shop. Warehouses outside North Branch are not available for this shop.',
    access: 'Sales default to the north warehouse. Staff access follows the assigned role.',
    employees: [
      { id: 'SH-004-EMP-007', code: 'EMP-007', name: 'Nadia Islam', role: 'Shop manager', assignment: 'Primary', status: 'Active' },
      { id: 'SH-004-EMP-005', code: 'EMP-005', name: 'Ali Hassan', role: 'Cashier', assignment: 'Primary', status: 'Active' },
      { id: 'SH-004-EMP-009', code: 'EMP-009', name: 'Farah Noor', role: 'Sales officer', assignment: 'Secondary', status: 'Active' },
    ],
  },
  {
    id: 'SH-005',
    code: 'SH-005',
    name: 'Airport Outlet',
    branch: 'Airport Branch',
    manager: 'Ali Hassan',
    status: 'Inactive',
    createdBy: 'Imran Qureshi',
    createdOn: 'May 21, 2026',
    updatedOn: 'Sep 11, 2026',
    summary: 'Outlet is inactive. New sales stay closed until the shop is set back to active.',
    access: 'Historical sales remain on the airport price list. Cash assignment is unchanged.',
    employees: [
      { id: 'SH-005-EMP-005', code: 'EMP-005', name: 'Ali Hassan', role: 'Cashier', assignment: 'Primary', status: 'Active' },
      { id: 'SH-005-EMP-001', code: 'EMP-001', name: 'Omar Khalid', role: 'Shop manager', assignment: 'Secondary', status: 'Active' },
    ],
  },
  {
    id: 'SH-006',
    code: 'SH-006',
    name: 'City Shop',
    branch: 'Central Branch',
    manager: 'Dhiar Khalid',
    status: 'Active',
    createdBy: 'Anika Rahman',
    createdOn: 'Jun 08, 2026',
    updatedOn: 'Sep 14, 2026',
    summary: 'City counter under Central Branch. Linked warehouses must belong to that branch.',
    access: 'Sales use the city shop price list. Cash follows the primary assignment.',
    employees: [
      { id: 'SH-006-EMP-010', code: 'EMP-010', name: 'Dhiar Khalid', role: 'Shop manager', assignment: 'Primary', status: 'Active' },
      { id: 'SH-006-EMP-006', code: 'EMP-006', name: 'Lina Abbas', role: 'Sales officer', assignment: 'Primary', status: 'Active' },
    ],
  },
  {
    id: 'SH-007',
    code: 'SH-007',
    name: 'Harbor Shop',
    branch: 'North Branch',
    manager: 'Nadia Islam',
    status: 'Active',
    createdBy: 'Anika Rahman',
    createdOn: 'Jul 19, 2026',
    updatedOn: 'Sep 16, 2026',
    summary: 'Harbor counter for North Branch. Only warehouses in that branch can be linked.',
    access: 'Receipts post to the harbor shop. Cash is limited to assigned cashiers.',
    employees: [
      { id: 'SH-007-EMP-004', code: 'EMP-004', name: 'Sara Khan', role: 'Sales officer', assignment: 'Primary', status: 'Active' },
      { id: 'SH-007-EMP-008', code: 'EMP-008', name: 'Reza Ahmed', role: 'Cashier', assignment: 'Secondary', status: 'Active' },
    ],
  },
  {
    id: 'SH-008',
    code: 'SH-008',
    name: 'West Shop',
    branch: 'Airport Branch',
    manager: 'Ali Hassan',
    status: 'Active',
    createdBy: 'Imran Qureshi',
    createdOn: 'Aug 02, 2026',
    updatedOn: 'Sep 19, 2026',
    summary: 'West shop sells from the airport branch warehouse and price list.',
    access: 'Sales default to this shop. Cash follows the assigned role.',
    employees: [
      { id: 'SH-008-EMP-007', code: 'EMP-007', name: 'Nadia Islam', role: 'Shop manager', assignment: 'Primary', status: 'Active' },
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

function shopColumns(onView, onEdit) {
  return [
    {
      key: 'code',
      label: 'CODE',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.code}</span>,
    },
    {
      key: 'name',
      label: 'SHOP',
      isRowHeader: true,
      renderCell: (item) => (
        <button type="button" onClick={() => onView(item)} className="text-[13px] font-medium text-slate-800">
          {item.name}
        </button>
      ),
    },
    {
      key: 'branch',
      label: 'BRANCH',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{item.branch}</span>,
    },
    {
      key: 'manager',
      label: 'MANAGER',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{item.manager}</span>,
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

const employeeColumns = [
  {
    key: 'code',
    label: 'CODE',
    renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.code}</span>,
  },
  {
    key: 'name',
    label: 'EMPLOYEE',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.name}</span>,
  },
  {
    key: 'role',
    label: 'ROLE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.role}</span>,
  },
  {
    key: 'assignment',
    label: 'ASSIGNMENT',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.assignment}</span>,
  },
  {
    key: 'status',
    label: 'STATUS',
    renderCell: (item) => <StatusPill status={item.status} />,
  },
]

function ShopPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const addedShops = useAddedShops()
  const overrides = useShopOverrides()
  const register = mergeShopRegister(addedShops, shops, overrides)
  const [tab, setTab] = useState('Shops')
  const [query, setQuery] = useState('')
  const [branch, setBranch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || shops[0].id)
  const [employeeId, setEmployeeId] = useState(shops[0].employees[0].id)

  const branches = [...new Set(register.map((shop) => shop.branch))]
  const needle = query.trim().toLowerCase()
  const filtered = register.filter((shop) => {
    const matchesQuery =
      !needle || shop.name.toLowerCase().includes(needle) || shop.code.toLowerCase().includes(needle)
    const matchesBranch = !branch || shop.branch === branch
    const matchesStatus = !status || shop.status === status
    return matchesQuery && matchesBranch && matchesStatus
  })
  const start = (page - 1) * pageSize
  const pageRows = filtered.slice(start, start + pageSize)
  const selected = pageRows.find((shop) => shop.id === selectedId) || pageRows[0] || null
  const employees = selected?.employees || []
  const selectedEmployee = employees.find((employee) => employee.id === employeeId) || employees[0] || null
  const activeCount = register.filter((shop) => shop.status === 'Active').length
  const staffCount = register.reduce((total, shop) => total + shop.employees.length, 0)

  function openTab(item) {
    if (item === 'Branches') {
      navigate('/organization/branches')
      return
    }
    if (item === 'Warehouses') {
      navigate('/organization/warehouses')
      return
    }
    if (item === 'Employees') {
      navigate('/organization/employees')
      return
    }
    setTab(item)
  }

  function selectShop(shop) {
    setSelectedId(shop.id)
    setEmployeeId(shop.employees[0]?.id || null)
  }

  function viewShop(shop) {
    navigate(`/organization/shop/${shop.id}`)
  }

  function editShop(shop) {
    navigate(`/organization/shop/${shop.id}/edit`)
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
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-700">Shops</span>
            <span>/</span>
            <span>Register</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Shops</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage retail locations, branch links, sales teams and shop defaults.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toast.success('Shop register exported.')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            <Download size={15} />
            Export
          </button>
          <button
            type="button"
            onClick={() => navigate('/organization/shop/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            <Plus size={15} />
            Add Shop
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
        <Stat label="Shops" value={register.length} />
        <Stat label="Active" value={activeCount} />
        <Stat label="Branches" value={branches.length} />
        <Stat label="Assigned staff" value={staffCount} />
      </section>

      {tab === 'Shops' ? (
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
                  <h2 className="text-sm font-semibold text-slate-900">Shops register</h2>
                </div>
                <GlobalTable
                  ariaLabel="Shops register"
                  columns={shopColumns(viewShop, editShop)}
                  data={pageRows}
                  pagination
                  rowsPerPage={pageSize}
                  page={page}
                  totalCount={filtered.length}
                  onPageChange={setPage}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent="No shops match these filters."
                  summary={
                    filtered.length
                      ? `Showing ${pageRows.length} ${pageRows.length === 1 ? 'record' : 'records'}${selected ? ' · 1 selected' : ''}`
                      : undefined
                  }
                  onRowPress={selectShop}
                  rowClassName={(shop) => (selected?.id === shop.id ? 'row-soft' : 'hover:bg-slate-50')}
                />
              </section>

              <section className="rounded-2xl border border-[#d7e6ff] bg-[#eef4ff] px-5 py-4">
                <h2 className="text-sm font-semibold text-[#2f6fed]">Organization rules</h2>
                <p className="mt-1 text-[13px] leading-5 text-slate-500">
                  Select the branch before choosing a linked warehouse. Only warehouses in that branch are available.
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="px-5 pt-4">
                  <h2 className="text-sm font-semibold text-slate-900">Assigned employees</h2>
                </div>
                <GlobalTable
                  ariaLabel="Assigned employees"
                  columns={employeeColumns}
                  data={employees}
                  pagination
                  rowsPerPage={pageSize}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent={selected ? 'This shop has no assigned employees.' : 'Select a shop to see assigned employees.'}
                  summary={
                    employees.length
                      ? `Showing ${employees.length} ${employees.length === 1 ? 'record' : 'records'}${selectedEmployee ? ' · 1 selected' : ''}`
                      : undefined
                  }
                  onRowPress={(employee) => setEmployeeId(employee.id)}
                  rowClassName={(employee) =>
                    selectedEmployee?.id === employee.id ? 'row-soft' : 'hover:bg-slate-50'
                  }
                />
              </section>
            </div>

            {selected ? <ShopDetail shop={selected} /> : null}
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

function ShopDetail({ shop }) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-4">
      <h2 className="text-[18px] font-semibold text-slate-900">{shop.name}</h2>
      <p className="mt-1 text-[13px] text-slate-400">{shop.code}</p>
      <div className="mt-3">
        <StatusPill status={shop.status} />
      </div>
      <p className="mt-4 text-[13px] leading-5 text-slate-500">{shop.summary}</p>
      <dl className="mt-5 space-y-3.5">
        <Fact label="Created by" value={shop.createdBy} />
        <Fact label="Created on" value={shop.createdOn} />
        <Fact label="Updated" value={shop.updatedOn} />
        <Fact label="Record status" value={shop.status} />
      </dl>
      <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
        <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">{shop.access}</p>
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

export default ShopPage
