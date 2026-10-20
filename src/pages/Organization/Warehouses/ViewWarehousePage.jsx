import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { mergeWarehouseRegister, useAddedWarehouses, useWarehouseOverrides } from './warehouseRecords.js'
import { warehouses as seedWarehouses } from './WarehousePage.jsx'

const statusClass = {
  Active: 'bg-[#e7f8ee] text-[#1f9d57]',
  Inactive: 'bg-[#eef1f4] text-[#8b95a5]',
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

function display(value) {
  const text = String(value ?? '').trim()
  return text || '—'
}

function ViewWarehousePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addedWarehouses = useAddedWarehouses()
  const overrides = useWarehouseOverrides()
  const register = mergeWarehouseRegister(addedWarehouses, seedWarehouses, overrides)
  const warehouse = register.find((item) => item.id === id || item.code === id) || null
  const [zoneId, setZoneId] = useState(warehouse?.zones?.[0]?.id || null)

  const zones = warehouse?.zones || []
  const selectedZone = zones.find((zone) => zone.id === zoneId) || zones[0] || null
  const activeCount = register.filter((item) => item.status === 'Active').length
  const zoneCount = register.reduce((total, item) => total + item.zones.length, 0)
  const custodianCount = register.filter((item) => item.custodian && item.custodian !== 'Unassigned').length

  if (!warehouse) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Warehouse not found</h1>
        <Link to="/organization/warehouses" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Warehouses
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <span>Organization</span>
            <span>/</span>
            <Link to="/organization/warehouses" className="hover:text-slate-700">
              Warehouses
            </Link>
            <span>/</span>
            <span className="text-slate-700">Detail</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">{warehouse.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Storage sites, bin locations, custodians, zones and stock access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/organization/warehouses"
            state={{ selectedId: warehouse.id }}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Back to Warehouses
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/organization/warehouses/${warehouse.id}/edit`)}
            className="rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Edit Warehouse
          </button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Warehouses" value={register.length} />
        <Stat label="Active" value={activeCount} />
        <Stat label="Storage zones" value={zoneCount} />
        <Stat label="Custodians" value={custodianCount} />
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Warehouse information</h2>
          <p className="mt-0.5 text-sm text-slate-400">Site, branch scope and custodian</p>

          <DetailSection title="Warehouse information">
            <Fact label="Warehouse name" value={warehouse.name} />
            <Fact label="Warehouse code" value={warehouse.code} />
            <Fact label="Parent branch" value={warehouse.branch} />
            <Fact label="Warehouse type" value={display(warehouse.type)} />
          </DetailSection>

          <DetailSection title="Location and capacity">
            <Fact label="Address" value={display(warehouse.address)} />
            <Fact label="Contact phone" value={display(warehouse.phone)} muted={!warehouse.phone} />
            <Fact label="Floor area" value={display(warehouse.floorArea)} />
            <Fact label="Storage capacity" value={display(warehouse.storageCapacity)} />
          </DetailSection>

          <DetailSection title="Stock controls and access" columns="xl:grid-cols-3">
            <Fact label="Custodian" value={display(warehouse.custodian)} />
            <Fact label="Default stock account" value={display(warehouse.stockAccount)} />
            <Fact label="Default zone" value={display(warehouse.defaultZone)} />
            <Fact label="Bin tracking" value={display(warehouse.binTracking)} />
            <Fact label="Negative stock" value={display(warehouse.negativeStock)} />
            <Fact label="Status" value={warehouse.status} />
          </DetailSection>

          <DetailSection title="Documents and notes">
            <Fact label="Document type" value={display(warehouse.documentType)} />
            <Fact label="Document reference" value={display(warehouse.documentReference)} />
            <Fact label="Uploaded document" value={display(warehouse.fileName)} />
            <Fact label="Internal notes" value={display(warehouse.notes)} muted={!warehouse.notes} />
          </DetailSection>
        </section>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900">{warehouse.name}</h2>
          <p className="mt-1 text-[13px] text-slate-400">{warehouse.code}</p>
          <div className="mt-3">
            <StatusPill status={warehouse.status} />
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{warehouse.summary}</p>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Created by" value={display(warehouse.createdBy)} />
            <SideFact label="Created on" value={display(warehouse.createdOn)} />
            <SideFact label="Updated" value={display(warehouse.updatedOn)} />
            <SideFact label="Record status" value={warehouse.status.toUpperCase()} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{warehouse.access}</p>
          </div>
        </aside>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="px-5 pt-4">
          <h2 className="text-sm font-semibold text-slate-900">Zones and bin locations</h2>
        </div>
        <GlobalTable
          ariaLabel="Zones and bin locations"
          columns={zoneColumns}
          data={zones}
          pagination
          rowsPerPage={5}
          className="h-auto! max-h-none!"
          contentClassName="min-w-full"
          emptyContent="This warehouse has no zones or bins."
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
  )
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClass[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
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

function DetailSection({ title, columns = 'xl:grid-cols-4', children }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-[#2f6fed]">{title}</h3>
      <div className={`mt-3 grid gap-4 sm:grid-cols-2 ${columns}`}>{children}</div>
    </div>
  )
}

function Fact({ label, value, muted = false }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] text-slate-400">{label}</p>
      <p className={`mt-1 text-[14px] font-medium ${muted ? 'text-slate-400' : 'text-slate-800'}`}>{value}</p>
    </div>
  )
}

function SideFact({ label, value }) {
  return (
    <div>
      <dt className="text-[13px] text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-[14px] font-medium text-slate-800">{value}</dd>
    </div>
  )
}

export default ViewWarehousePage
