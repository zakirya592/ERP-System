import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { useWarehouse } from '../../../queries/warehouses/warehouses.queries.js'
import { display, mapWarehouse, statusClassName, warehouseAccess } from './warehouseRecords.js'

const locationColumns = [
  {
    key: 'code',
    label: 'CODE',
    renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{display(item.code)}</span>,
  },
  {
    key: 'name',
    label: 'LOCATION',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{display(item.name)}</span>,
  },
  {
    key: 'type',
    label: 'TYPE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.type)}</span>,
  },
  {
    key: 'custodian',
    label: 'CUSTODIAN',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.custodian)}</span>,
  },
  {
    key: 'status',
    label: 'STATUS',
    renderCell: (item) => <StatusPill status={item.status} />,
  },
]

function ViewWarehousePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const warehouseQuery = useWarehouse(id)
  const warehouse = warehouseQuery.data?.data ? mapWarehouse(warehouseQuery.data.data) : null
  const summary = warehouseQuery.data?.data?.summary
  const [locationId, setLocationId] = useState(null)

  const locations = warehouse?.locations || []
  const selectedLocation = locations.find((item) => item.id === locationId) || locations[0] || null

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
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">{warehouse?.name || 'Warehouse'}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Storage sites, bin locations, custodians, zones and stock access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/organization/warehouses" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700">
            Back to Warehouses
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/organization/warehouses/${id}/edit`)}
            className="cursor-pointer rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Edit Warehouse
          </button>
        </div>
      </div>

      {warehouseQuery.isLoading && <Panel>Loading warehouse...</Panel>}
      {warehouseQuery.isError && (
        <Panel className="text-rose-500">{warehouseQuery.error.response?.data?.message || 'Could not load this warehouse.'}</Panel>
      )}

      {warehouse && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Warehouses" value={summary?.warehouses?.total ?? '—'} />
            <Stat label="Active" value={summary?.warehouses?.active ?? '—'} />
            <Stat label="Storage zones" value={summary?.storageZones ?? '—'} />
            <Stat label="Custodians" value={summary?.custodians ?? '—'} />
          </section>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Warehouse information</h2>
              <p className="mt-0.5 text-sm text-slate-400">Site, branch scope and custodian</p>

              <DetailSection title="Warehouse information">
                <Fact label="Warehouse name" value={display(warehouse.name)} />
                <Fact label="Warehouse code" value={display(warehouse.code)} />
                <Fact label="Parent branch" value={display(warehouse.branch)} />
                <Fact label="Warehouse type" value={display(warehouse.type)} />
              </DetailSection>

              <DetailSection title="Location and capacity">
                <Fact label="Address" value={display(warehouse.address)} />
                <Fact label="Location" value={display(warehouse.location)} />
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

              <DetailSection title="Notes">
                <Fact label="Internal notes" value={display(warehouse.notes)} muted={!warehouse.notes} />
              </DetailSection>
            </section>

            <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
              <h2 className="text-[18px] font-semibold text-slate-900">{display(warehouse.name)}</h2>
              <p className="mt-1 text-[13px] text-slate-400">{display(warehouse.code)}</p>
              <div className="mt-3">
                <StatusPill status={warehouse.status} />
              </div>
              <p className="mt-4 text-[13px] leading-5 text-slate-500">{warehouse.summary}</p>
              <dl className="mt-5 space-y-3.5">
                <SideFact label="Created on" value={display(warehouse.createdOn)} />
                <SideFact label="Updated" value={display(warehouse.updatedOn)} />
                <SideFact label="Record status" value={warehouse.status} />
              </dl>
              <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
                <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
                <p className="mt-1 text-[13px] leading-5 text-slate-600">{warehouseAccess}</p>
              </div>
            </aside>
          </div>

          <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="px-5 pt-4">
              <h2 className="text-sm font-semibold text-slate-900">Zones and bin locations</h2>
            </div>
            <GlobalTable
              ariaLabel="Zones and bin locations"
              columns={locationColumns}
              data={locations}
              pagination
              rowsPerPage={5}
              className="h-auto! max-h-none!"
              contentClassName="min-w-full"
              emptyContent="This warehouse has no locations."
              summary={
                locations.length
                  ? `Showing ${locations.length} ${locations.length === 1 ? 'record' : 'records'}${selectedLocation ? ' · 1 selected' : ''}`
                  : undefined
              }
              onRowPress={(item) => setLocationId(item.id)}
              rowClassName={(item) => (selectedLocation?.id === item.id ? 'row-soft' : 'hover:bg-slate-50')}
            />
          </section>
        </>
      )}
    </div>
  )
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(status)}`}>
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

function Panel({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center text-sm font-semibold shadow-sm ${className}`}>
      {children}
    </section>
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
