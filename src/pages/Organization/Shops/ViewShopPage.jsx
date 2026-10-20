import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { useShop } from '../../../queries/shops/shops.queries.js'
import { display, mapShop, shopAccess, statusClassName } from './shopRecords.js'

const employeeColumns = [
  {
    key: 'code',
    label: 'CODE',
    renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{display(item.code)}</span>,
  },
  {
    key: 'name',
    label: 'EMPLOYEE',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{display(item.name)}</span>,
  },
  {
    key: 'role',
    label: 'ROLE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.role)}</span>,
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

function ViewShopPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const shopQuery = useShop(id)
  const shop = shopQuery.data?.data ? mapShop(shopQuery.data.data) : null
  const summary = shopQuery.data?.data?.summary
  const [employeeId, setEmployeeId] = useState(null)

  const employees = shop?.employees || []
  const selectedEmployee = employees.find((employee) => employee.id === employeeId) || employees[0] || null

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
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">{shop?.name || 'Shop'}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage retail locations, branch links, sales teams and shop defaults.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/organization/shop" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700">
            Back to Shops
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/organization/shop/${id}/edit`)}
            className="cursor-pointer rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Edit Shop
          </button>
        </div>
      </div>

      {shopQuery.isLoading && <Panel>Loading shop...</Panel>}
      {shopQuery.isError && (
        <Panel className="text-rose-500">{shopQuery.error.response?.data?.message || 'Could not load this shop.'}</Panel>
      )}

      {shop && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Shops" value={summary?.shops?.total ?? '—'} />
            <Stat label="Active" value={summary?.shops?.active ?? '—'} />
            <Stat label="Branches" value={summary?.branches ?? '—'} />
            <Stat label="Assigned staff" value={summary?.assignedStaff ?? '—'} />
          </section>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Shop information</h2>
              <p className="mt-0.5 text-sm text-slate-400">Profile, assignment and operating defaults</p>

              <DetailSection title="Shop information">
                <Fact label="Shop name" value={display(shop.name)} />
                <Fact label="Shop code" value={display(shop.code)} />
                <Fact label="Parent branch" value={display(shop.branch)} />
                <Fact label="Shop type" value={display(shop.type)} />
              </DetailSection>

              <DetailSection title="Location and contact">
                <Fact label="Address" value={display(shop.address)} />
                <Fact label="City / district" value={display(shop.location)} />
                <Fact label="Phone" value={display(shop.phone)} muted={!shop.phone} />
                <Fact label="Email" value={display(shop.email)} />
              </DetailSection>

              <DetailSection title="Sales and assignments" columns="xl:grid-cols-3">
                <Fact label="Linked warehouse" value={display(shop.warehouse)} />
                <Fact label="Price list" value={display(shop.priceList)} />
                <Fact label="Cash account" value={display(shop.cashAccount)} />
                <Fact label="Opening hours" value={display(shop.openingHours)} />
                <Fact label="Status" value={shop.status} />
              </DetailSection>

              <DetailSection title="Notes">
                <Fact label="Internal notes" value={display(shop.notes)} />
              </DetailSection>
            </section>

            <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
              <h2 className="text-[18px] font-semibold text-slate-900">{display(shop.name)}</h2>
              <p className="mt-1 text-[13px] text-slate-400">{display(shop.code)}</p>
              <div className="mt-3">
                <StatusPill status={shop.status} />
              </div>
              <p className="mt-4 text-[13px] leading-5 text-slate-500">{shop.summary}</p>
              <dl className="mt-5 space-y-3.5">
                <SideFact label="Created on" value={display(shop.createdOn)} />
                <SideFact label="Updated" value={display(shop.updatedOn)} />
                <SideFact label="Record status" value={shop.status} />
              </dl>
              <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
                <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
                <p className="mt-1 text-[13px] leading-5 text-slate-600">{shopAccess}</p>
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
            onClick={() => navigate(`/organization/shop/${shop.id}/edit`)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Edit assignments
          </button>
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

export default ViewShopPage
