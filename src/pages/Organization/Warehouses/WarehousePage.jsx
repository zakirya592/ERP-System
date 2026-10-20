import { useState } from 'react'
import { Download, Plus, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { mergeWarehouseRegister, useAddedWarehouses, useWarehouseOverrides } from './warehouseRecords.js'

const pageSize = 5

const tabs = ['Branches', 'Shops', 'Warehouses', 'Employees', 'Owners', 'Partnerships']

const organizationRule =
  'Warehouse access is scoped to the parent branch. A location with stock or open transfers cannot be archived.'

export const warehouses = [
  {
    id: 'WH-001',
    code: 'WH-001',
    name: 'Main Warehouse',
    branch: 'Central Branch',
    type: 'Finished goods',
    custodian: 'Omar Khalid',
    status: 'Active',
    address: 'Warehouse Road, City Center',
    phone: '',
    floorArea: '2,450 sq ft',
    storageCapacity: '120,000 kg',
    stockAccount: 'Inventory — finished goods',
    defaultZone: 'Zone A',
    binTracking: 'Enabled',
    negativeStock: 'Blocked',
    documentType: 'Warehouse layout / lease',
    documentReference: 'DOC-2026-001',
    fileName: 'agreement-or-record.pdf',
    notes: '',
    createdBy: 'Anika Rahman',
    createdOn: 'Jan 01, 2026',
    updatedOn: 'Sep 20, 2026',
    summary: organizationRule,
    access: 'Quality hold stock remains visible but unavailable for normal dispatch.',
    zones: [
      { id: 'WH-001-ZN-A', code: 'ZN-A', name: 'Zone A · Dry', use: 'Finished goods', capacity: '40,000 kg', status: 'Active' },
      { id: 'WH-001-ZN-B', code: 'ZN-B', name: 'Zone B · Chill', use: 'Raw materials', capacity: '18,000 kg', status: 'Active' },
      { id: 'WH-001-QC', code: 'QC-BIN', name: 'QC Hold · QA', use: 'Quarantine', capacity: '2,500 kg', status: 'Active' },
    ],
  },
  {
    id: 'WH-002',
    code: 'WH-002',
    name: 'Reserve Warehouse',
    branch: 'Central Branch',
    custodian: 'Sara Khan',
    status: 'Active',
    address: '14 Storage Road',
    city: 'City Center',
    phone: '',
    notes: '',
    createdBy: 'Anika Rahman',
    createdOn: 'Feb 12, 2026',
    updatedOn: 'Sep 18, 2026',
    summary: 'Overflow site for Central Branch. Stock here stays inside the same branch scope as Main Warehouse.',
    access: 'Reserve bins can receive transfers from Main Warehouse. Dispatch to other branches stays closed.',
    zones: [
      { id: 'WH-002-ZN-C', code: 'ZN-C', name: 'Bulk Store', use: 'Bulk goods', capacity: '55,000 kg', status: 'Active' },
      { id: 'WH-002-ZN-D', code: 'ZN-D', name: 'Overflow', use: 'Finished goods', capacity: '12,000 kg', status: 'Active' },
      { id: 'WH-002-BIN', code: 'BIN-01', name: 'Reserve Bin', use: 'Spare parts', capacity: '4,000 kg', status: 'Active' },
    ],
  },
  {
    id: 'WH-003',
    code: 'WH-003',
    name: 'North Warehouse',
    branch: 'North Branch',
    custodian: 'Hafiz Salman',
    status: 'Active',
    address: '8 Industrial Park',
    city: 'North District',
    phone: '',
    notes: '',
    createdBy: 'Imran Qureshi',
    createdOn: 'Mar 04, 2026',
    updatedOn: 'Aug 30, 2026',
    summary: 'Primary store for North Branch. Shops outside this branch cannot draw stock from these zones.',
    access: 'North shops pick from the dry and cold zones. Receiving stays on the inbound bin.',
    zones: [
      { id: 'WH-003-ZN-N1', code: 'ZN-N1', name: 'North Dry', use: 'Finished goods', capacity: '28,000 kg', status: 'Active' },
      { id: 'WH-003-ZN-N2', code: 'ZN-N2', name: 'North Cold', use: 'Raw materials', capacity: '9,500 kg', status: 'Active' },
      { id: 'WH-003-BIN', code: 'BIN-N', name: 'Receiving', use: 'Inbound', capacity: '3,200 kg', status: 'Active' },
    ],
  },
  {
    id: 'WH-004',
    code: 'WH-004',
    name: 'Transit Warehouse',
    branch: 'North Branch',
    custodian: 'Ali Hassan',
    status: 'Active',
    address: '2 Logistics Yard',
    city: 'North District',
    phone: '',
    notes: '',
    createdBy: 'Anika Rahman',
    createdOn: 'Apr 16, 2026',
    updatedOn: 'Sep 02, 2026',
    summary: 'Cross-dock for North Branch. Open transfers keep this location from being archived.',
    access: 'Staging stock is visible to dispatch. Quarantine hold cannot be sold.',
    zones: [
      { id: 'WH-004-ZN-T', code: 'ZN-T', name: 'Staging', use: 'Cross-dock', capacity: '8,000 kg', status: 'Active' },
      { id: 'WH-004-ZN-T2', code: 'ZN-T2', name: 'Dispatch', use: 'Outbound', capacity: '6,500 kg', status: 'Active' },
      { id: 'WH-004-BIN', code: 'BIN-T', name: 'Hold', use: 'Quarantine', capacity: '1,200 kg', status: 'Active' },
    ],
  },
  {
    id: 'WH-005',
    code: 'WH-005',
    name: 'Airport Warehouse',
    branch: 'Airport Branch',
    custodian: 'Lina Abbas',
    status: 'Active',
    address: 'Cargo Terminal',
    city: 'Airport',
    phone: '',
    notes: '',
    createdBy: 'Imran Qureshi',
    createdOn: 'May 21, 2026',
    updatedOn: 'Sep 11, 2026',
    summary: 'Secure store for Airport Branch. Customs hold stays in this location until it is released.',
    access: 'Only airport staff can issue stock. Customs bins stay unavailable for normal dispatch.',
    zones: [
      { id: 'WH-005-ZN-AP', code: 'ZN-AP', name: 'Secure', use: 'Finished goods', capacity: '15,000 kg', status: 'Active' },
      { id: 'WH-005-BIN', code: 'BIN-AP', name: 'Customs', use: 'Quarantine', capacity: '2,000 kg', status: 'Active' },
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

function warehouseColumns(onView, onEdit) {
  return [
    {
      key: 'code',
      label: 'CODE',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.code}</span>,
    },
    {
      key: 'name',
      label: 'WAREHOUSE',
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
      key: 'custodian',
      label: 'CUSTODIAN',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{item.custodian}</span>,
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

const zoneColumns = [
  {
    key: 'code',
    label: 'CODE',
    renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.code}</span>,
  },
  {
    key: 'name',
    label: 'ZONE / BIN',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.name}</span>,
  },
  {
    key: 'use',
    label: 'USE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.use}</span>,
  },
  {
    key: 'capacity',
    label: 'CAPACITY',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.capacity}</span>,
  },
  {
    key: 'status',
    label: 'STATUS',
    renderCell: (item) => <StatusPill status={item.status} />,
  },
]

function WarehousePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const addedWarehouses = useAddedWarehouses()
  const overrides = useWarehouseOverrides()
  const register = mergeWarehouseRegister(addedWarehouses, warehouses, overrides)
  const [tab, setTab] = useState(location.state?.tab || 'Warehouses')
  const [query, setQuery] = useState('')
  const [branch, setBranch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || warehouses[0].id)
  const [zoneId, setZoneId] = useState(warehouses[0].zones[0].id)

  const branches = [...new Set(register.map((warehouse) => warehouse.branch))]
  const needle = query.trim().toLowerCase()
  const filtered = register.filter((warehouse) => {
    const matchesQuery =
      !needle ||
      warehouse.name.toLowerCase().includes(needle) ||
      warehouse.code.toLowerCase().includes(needle)
    const matchesBranch = !branch || warehouse.branch === branch
    const matchesStatus = !status || warehouse.status === status
    return matchesQuery && matchesBranch && matchesStatus
  })
  const start = (page - 1) * pageSize
  const pageRows = filtered.slice(start, start + pageSize)
  const selected = pageRows.find((warehouse) => warehouse.id === selectedId) || pageRows[0] || null
  const zones = selected?.zones || []
  const selectedZone = zones.find((zone) => zone.id === zoneId) || zones[0] || null
  const activeCount = register.filter((warehouse) => warehouse.status === 'Active').length
  const zoneCount = register.reduce((total, warehouse) => total + warehouse.zones.length, 0)
  const custodianCount = register.filter((warehouse) => warehouse.custodian && warehouse.custodian !== 'Unassigned').length

  function openTab(item) {
    if (item === 'Branches') {
      navigate('/organization/branches')
      return
    }
    if (item === 'Shops') {
      navigate('/organization/shop')
      return
    }
    if (item === 'Employees') {
      navigate('/organization/employees')
      return
    }
    setTab(item)
  }

  function selectWarehouse(warehouse) {
    setSelectedId(warehouse.id)
    setZoneId(warehouse.zones[0]?.id || null)
  }

  function viewWarehouse(warehouse) {
    navigate(`/organization/warehouses/${warehouse.id}`)
  }

  function editWarehouse(warehouse) {
    navigate(`/organization/warehouses/${warehouse.id}/edit`)
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
            <span className="text-slate-700">Warehouses</span>
            <span>/</span>
            <span>Register</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Warehouses</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Storage sites, bin locations, custodians, zones and stock access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toast.success('Warehouse register exported.')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            <Download size={15} />
            Export
          </button>
          <button
            type="button"
            onClick={() => navigate('/organization/warehouses/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            <Plus size={15} />
            Add Warehouse
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
        <Stat label="Warehouses" value={register.length} />
        <Stat label="Active" value={activeCount} />
        <Stat label="Storage zones" value={zoneCount} />
        <Stat label="Custodians" value={custodianCount} />
      </section>

      {tab === 'Warehouses' ? (
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
                  <h2 className="text-sm font-semibold text-slate-900">Warehouses register</h2>
                </div>
                <GlobalTable
                  ariaLabel="Warehouses register"
                  columns={warehouseColumns(viewWarehouse, editWarehouse)}
                  data={pageRows}
                  pagination
                  rowsPerPage={pageSize}
                  page={page}
                  totalCount={filtered.length}
                  onPageChange={setPage}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent="No warehouses match these filters."
                  summary={
                    filtered.length
                      ? `Showing ${pageRows.length} ${pageRows.length === 1 ? 'record' : 'records'}${selected ? ' · 1 selected' : ''}`
                      : undefined
                  }
                  onRowPress={selectWarehouse}
                  rowClassName={(warehouse) => (selected?.id === warehouse.id ? 'row-soft' : 'hover:bg-slate-50')}
                />
              </section>

              <section className="rounded-2xl border border-[#d7e6ff] bg-[#eef4ff] px-5 py-4">
                <h2 className="text-sm font-semibold text-[#2f6fed]">Organization rules</h2>
                <p className="mt-1 text-[13px] leading-5 text-slate-500">{organizationRule}</p>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="px-5 pt-4">
                  <h2 className="text-sm font-semibold text-slate-900">Zones and bin locations</h2>
                </div>
                <GlobalTable
                  ariaLabel="Zones and bin locations"
                  columns={zoneColumns}
                  data={zones}
                  pagination
                  rowsPerPage={pageSize}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent={selected ? 'This warehouse has no zones or bins.' : 'Select a warehouse to see zones and bins.'}
                  summary={
                    zones.length
                      ? `Showing ${zones.length} ${zones.length === 1 ? 'record' : 'records'}${selectedZone ? ' · 1 selected' : ''}`
                      : undefined
                  }
                  onRowPress={(zone) => setZoneId(zone.id)}
                  rowClassName={(zone) => (selectedZone?.id === zone.id ? 'row-soft' : 'hover:bg-slate-50')}
                />
              </section>
            </div>

            {selected ? <WarehouseDetail warehouse={selected} /> : null}
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

function WarehouseDetail({ warehouse }) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-4">
      <h2 className="text-[18px] font-semibold text-slate-900">{warehouse.name}</h2>
      <p className="mt-1 text-[13px] text-slate-400">{warehouse.code}</p>
      <div className="mt-3">
        <StatusPill status={warehouse.status} />
      </div>
      <p className="mt-4 text-[13px] leading-5 text-slate-500">{warehouse.summary}</p>
      <dl className="mt-5 space-y-3.5">
        <Fact label="Created by" value={warehouse.createdBy} />
        <Fact label="Created on" value={warehouse.createdOn} />
        <Fact label="Updated" value={warehouse.updatedOn} />
        <Fact label="Record status" value={warehouse.status.toUpperCase()} />
      </dl>
      <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
        <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">{warehouse.access}</p>
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

export default WarehousePage
