import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { useBranch } from '../../../queries/branches/branches.queries.js'


const statusClass = {
  Active: 'bg-[#e7f8ee] text-[#1f9d57]',
  Inactive: 'bg-slate-100 text-slate-500',
}

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

function titleType(type) {
  const value = String(type || '').toLowerCase()
  if (value === 'warehouse') return 'Warehouse'
  if (value === 'shop') return 'Shop'
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

function branchTypeName(branch) {
  if (branch.branchTypeLabel) return branch.branchTypeLabel
  const value = String(branch.branchType || '').replace(/[_-]+/g, ' ')
  if (!value) return '—'
  return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

function relatedName(value) {
  if (!value) return '—'
  if (typeof value === 'string') return value
  return display(value.name || value.code)
}

function ViewBranchPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const branchQuery = useBranch(id)
  const branch = branchQuery.data?.data
  const [selectedId, setSelectedId] = useState(null)

  const summary = branch?.summary
  const locations = (branch?.locations || []).map((location) => ({
    id: location._id,
    code: display(location.code),
    name: display(location.name),
    type: titleType(location.type),
    custodian: relatedName(location.manager || location.managerId),
    status: titleStatus(location.status),
  }))
  const selected = locations.find((location) => location.id === selectedId) || locations[0] || null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
           <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
              Dashboard
            </Link>
           
            <span>/</span>
            <Link to="/organization/branches" className="text-slate-700 hover:text-slate-900">
             Organization Branches
            </Link>
            <span>/</span>
            <span className="text-slate-500">Branch</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">
            {branch?.name || 'Branch'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage operating branches, locations, managers and branch access.
          </p>
        </div>
        <div className="flex items-center gap-4">
         
          <Link
            to={`/organization/branches/${id}/edit`}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Edit Branch
          </Link>
        </div>
      </div>

      {branchQuery.isLoading && <Panel>Loading branch...</Panel>}
      {branchQuery.isError && (
        <Panel className="text-rose-500">
          {branchQuery.error.response?.data?.message || 'Could not load this branch.'}
        </Panel>
      )}

      {branch && (
        <>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Branches" value={summary?.branches?.total ?? '—'} />
            <Stat label="Active" value={summary?.branches?.active ?? '—'} />
            <Stat label="Shops" value={summary?.shops?.total ?? '—'} />
            <Stat label="Warehouses" value={summary?.warehouses?.total ?? '—'} />
          </section>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Branch information</h2>
              <p className="mt-0.5 text-sm text-slate-400">Profile, assignment and operating defaults</p>

              <Section title="Branch information">
                <Fact label="Branch name" value={display(branch.name)} />
                <Fact label="Branch code" value={display(branch.code)} />
                <Fact label="Branch type" value={branchTypeName(branch)} />
                <Fact label="Opening date" value={formatDate(branch.openingDate)} />
              </Section>

              <Section title="Address and contact">
                <Fact label="Address" value={display(branch.address)} />
                <Fact label="City / district" value={display(branch.location)} />
                <Fact label="Phone" value={branch.phone ? display(branch.phone) : 'Enter business phone'} muted={!branch.phone} />
                <Fact label="Email" value={display(branch.email)} />
              </Section>

              <Section title="Management and defaults">
                <Fact label="Branch manager" value={relatedName(branch.manager || branch.managerId)} />
                <Fact label="Default warehouse" value={relatedName(branch.defaultWarehouse || branch.defaultWarehouseId)} />
                <Fact label="Default shop" value={relatedName(branch.defaultShop || branch.defaultShopId)} />
                <Fact label="Status" value={titleStatus(branch.status)} />
                <Fact label="Cost centre" value={display(branch.costCentre)} />
                <Fact label="Document prefix" value={display(branch.documentPrefix)} />
              </Section>
            </section>

            <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-4">
              <h2 className="text-[18px] font-semibold text-slate-900">{branch.name}</h2>
              <p className="mt-2 text-[13px] text-slate-400">{display(branch.code)}</p>
              <div className="mt-3">
                <StatusPill status={titleStatus(branch.status)} />
              </div>
              <p className="mt-4 text-[13px] leading-5 text-slate-500">
                Each shop and warehouse belongs to one branch. Access is limited to assigned locations.
              </p>
              <dl className="mt-4 space-y-3.5">
                <SideFact label="Created by" value={relatedName(branch.createdBy)} />
                <SideFact label="Created on" value={formatDate(branch.createdAt)} />
                <SideFact label="Updated" value={formatDate(branch.updatedAt)} />
                <SideFact label="Record status" value={titleStatus(branch.status)} />
              </dl>
              <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
                <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
                <p className="mt-1 text-[13px] leading-5 text-slate-600">
                  Branch access permits operational work, approval and posting remain role-based.
                </p>
              </div>
            </aside>
          </div>

          <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="px-5 pt-4">
              <h2 className="text-sm font-semibold text-slate-900">Shops and warehouses</h2>
            </div>
            <GlobalTable
              ariaLabel="Shops and warehouses"
              columns={locationColumns}
              data={locations}
              pagination
              rowsPerPage={10}
              className="h-auto! max-h-none!"
              contentClassName="min-w-full"
              emptyContent="This branch has no shops or warehouses."
              summary={
                locations.length
                  ? `Showing ${locations.length} ${locations.length === 1 ? 'record' : 'records'}${selected ? ' · 1 selected' : ''
                  }`
                  : undefined
              }
              onRowPress={(location) => setSelectedId(location.id)}
              rowClassName={(location) => (selected?.id === location.id ? 'row-soft' : 'hover:bg-slate-50')}
            />
          </section>

          <div className="flex flex-wrap gap-2">
            <ActionButton label="Add Shop" onClick={() => navigate('/organization/shop/new')} />
            <ActionButton label="Add Warehouse" onClick={() => navigate('/organization/warehouses/new')} />
            <ActionButton label="Assign Employee" onClick={() => navigate('/organization/employees/new')} />
          </div>
        </>
      )}
    </div>
  )
}

const locationColumns = [
  {
    key: 'code',
    label: 'CODE',
    renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.code}</span>,
  },
  {
    key: 'name',
    label: 'LOCATION',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.name}</span>,
  },
  {
    key: 'type',
    label: 'TYPE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.type}</span>,
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
]

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

function Section({ title, children }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-[#2f6fed]">{title}</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  )
}

function Fact({ label, value, muted = false }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] text-slate-400">{label}</p>
      <p className={`mt-1 text-[14px] font-medium wrap-break-word ${muted ? 'text-slate-400' : 'text-slate-800'}`}>{value}</p>
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

function Panel({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center text-sm text-slate-400 shadow-sm ${className}`}>
      {children}
    </section>
  )
}

function ActionButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
    >
      <Plus size={14} />
      {label}
    </button>
  )
}

export default ViewBranchPage
