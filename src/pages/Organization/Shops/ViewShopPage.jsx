import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { mergeShopRegister, useAddedShops, useShopOverrides } from './shopRecords.js'
import { shops as seedShops } from './ShopPage.jsx'

const statusClass = {
  Active: 'bg-[#e7f8ee] text-[#1f9d57]',
  Inactive: 'bg-[#eef1f4] text-[#8b95a5]',
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

function display(value) {
  const text = String(value ?? '').trim()
  return text || '—'
}

function ViewShopPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addedShops = useAddedShops()
  const overrides = useShopOverrides()
  const register = mergeShopRegister(addedShops, seedShops, overrides)
  const shop = register.find((item) => item.id === id || item.code === id) || null
  const [employeeId, setEmployeeId] = useState(shop?.employees?.[0]?.id || null)

  const employees = shop?.employees || []
  const selectedEmployee = employees.find((employee) => employee.id === employeeId) || employees[0] || null
  const activeCount = register.filter((item) => item.status === 'Active').length
  const branchCount = new Set(register.map((item) => item.branch)).size
  const staffCount = register.reduce((total, item) => total + item.employees.length, 0)

  if (!shop) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Shop not found</h1>
        <Link to="/organization/shop" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Shops
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
            <Link to="/organization/shop" className="hover:text-slate-700">
              Shops
            </Link>
            <span>/</span>
            <span className="text-slate-700">Detail</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">{shop.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage retail locations, branch links, sales teams and shop defaults.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/organization/shop"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Back to Shops
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/organization/shop/${shop.id}/edit`)}
            className="rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Edit Shop
          </button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Shops" value={register.length} />
        <Stat label="Active" value={activeCount} />
        <Stat label="Branches" value={branchCount} />
        <Stat label="Assigned staff" value={staffCount} />
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Shop information</h2>
          <p className="mt-0.5 text-sm text-slate-400">Profile, assignment and operating defaults</p>

          <DetailSection title="Shop information">
            <Fact label="Shop name" value={shop.name} />
            <Fact label="Shop code" value={shop.code} />
            <Fact label="Parent branch" value={shop.branch} />
            <Fact label="Shop type" value={display(shop.type)} />
          </DetailSection>

          <DetailSection title="Location and contact">
            <Fact label="Address" value={display(shop.address)} />
            <Fact label="City / district" value={display(shop.city)} />
            <Fact label="Phone" value={display(shop.phone)} muted={!shop.phone || shop.phone === 'Enter shop phone'} />
            <Fact label="Email" value={display(shop.email)} />
          </DetailSection>

          <DetailSection title="Sales and assignments" columns="xl:grid-cols-3">
            <Fact label="Shop manager" value={display(shop.manager)} />
            <Fact label="Linked warehouse" value={display(shop.warehouse)} />
            <Fact label="Price list" value={display(shop.priceList)} />
            <Fact label="Cash account" value={display(shop.cashAccount)} />
            <Fact label="Opening hours" value={display(shop.openingHours)} />
            <Fact label="Status" value={shop.status} />
          </DetailSection>
        </section>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900">{shop.name}</h2>
          <p className="mt-1 text-[13px] text-slate-400">{shop.code}</p>
          <div className="mt-3">
            <StatusPill status={shop.status} />
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{shop.summary}</p>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Created by" value={display(shop.createdBy)} />
            <SideFact label="Created on" value={display(shop.createdOn)} />
            <SideFact label="Updated" value={display(shop.updatedOn)} />
            <SideFact label="Record status" value={shop.status} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{shop.access}</p>
          </div>
        </aside>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="px-5 pt-4">
          <h2 className="text-sm font-semibold text-slate-900">Assigned employees</h2>
        </div>
        <GlobalTable
          ariaLabel="Assigned employees"
          columns={employeeColumns}
          data={employees}
          pagination
          rowsPerPage={5}
          className="h-auto! max-h-none!"
          contentClassName="min-w-full"
          emptyContent="This shop has no assigned employees."
          summary={
            employees.length
              ? `Showing ${employees.length} ${employees.length === 1 ? 'record' : 'records'}${selectedEmployee ? ' · 1 selected' : ''}`
              : undefined
          }
          onRowPress={(employee) => setEmployeeId(employee.id)}
          rowClassName={(employee) => (selectedEmployee?.id === employee.id ? 'row-soft' : 'hover:bg-slate-50')}
        />
      </section>

      <button
        type="button"
        onClick={() => toast.success('Edit assignments opened.')}
        className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
      >
        Edit assignments
      </button>
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

export default ViewShopPage
