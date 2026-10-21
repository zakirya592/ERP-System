import { useEffect, useState } from 'react'
import { Eye, Pencil, Plus, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ExportButton from '../../../components/ExportButton.jsx'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { getShops } from '../../../api/shops.api.js'
import { useBranches } from '../../../queries/branches/branches.queries.js'
import { fetchAllPages } from '../../../utils/exportExcel.js'
import { useShop, useShops, useUpdateShopStatus } from '../../../queries/shops/shops.queries.js'
import { display, mapShop, shopAccess, shopRule, shopStatuses, statusClassName } from './shopRecords.js'

const limit = 20

const tabs = ['Branches', 'Shops', 'Warehouses', 'Employees', 'Owners', 'Partnerships']

const tabRoutes = {
  Branches: '/organization/branches',
  Warehouses: '/organization/warehouses',
  Employees: '/organization/employees',
  Owners: '/organization/owners',
  Partnerships: '/organization/partnerships',
}

const statusOptions = [{ label: 'All statuses', value: '' }, ...shopStatuses]

function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(status)}`}>
      {status}
    </span>
  )
}

function shopColumns(onView, onEdit) {
  return [
    {
      key: 'code',
      label: 'CODE',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{display(item.code)}</span>,
    },
    {
      key: 'name',
      label: 'SHOP',
      isRowHeader: true,
      renderCell: (item) => (
        <button type="button" onClick={() => onView(item)} className="cursor-pointer text-[13px] font-medium text-slate-800">
          {display(item.name)}
        </button>
      ),
    },
    {
      key: 'branch',
      label: 'BRANCH',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.branch)}</span>,
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
        <div className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`View ${item.name}`}
            onClick={() => onView(item)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            aria-label={`Update ${item.name}`}
            onClick={() => onEdit(item)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Pencil size={16} />
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

function ShopPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState('Shops')
  const [query, setQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [branch, setBranch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || null)
  const [employeeId, setEmployeeId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, branch])

  const shopsQuery = useShops({
    page,
    limit,
    search: debouncedSearch,
    status,
    branchId: branch,
  })
  const updateStatus = useUpdateShopStatus()
  const branchesQuery = useBranches({ page: 1, limit: 50, search: '', status: '' })
  const pageRows = (shopsQuery.data?.data || []).map(mapShop)
  const total = shopsQuery.data?.meta?.total ?? pageRows.length
  const summary = shopsQuery.data?.meta?.summary || shopsQuery.data?.data?.[0]?.summary
  const selected = pageRows.find((shop) => shop.id === selectedId) || pageRows[0] || null

  useEffect(() => {
    if (selectedId && pageRows.some((shop) => shop.id === selectedId)) return
    if (pageRows[0]) setSelectedId(pageRows[0].id)
  }, [pageRows, selectedId])

  const detailQuery = useShop(selected?.id)
  const detail = detailQuery.data?.data ? mapShop(detailQuery.data.data) : null
  const profile = detail || selected
  const employees = profile?.employees || []
  const selectedEmployee = employees.find((employee) => employee.id === employeeId) || employees[0] || null
  const branchOptions = (branchesQuery.data?.data || []).map((item) => ({
    id: item._id,
    name: item.name,
  }))

  function openTab(item) {
    const route = tabRoutes[item]
    if (route) {
      navigate(route)
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

  function changeStatus(nextStatus) {
    if (!profile?.id || profile.statusValue === nextStatus || updateStatus.isPending) return
    updateStatus.mutate(
      { id: profile.id, status: nextStatus },
      {
        onSuccess: (data) => {
          const label = shopStatuses.find((option) => option.value === nextStatus)?.label || nextStatus
          toast.success(data?.message || `${profile.name || 'Shop'} is now ${label}.`)
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Could not update the shop status.')
        },
      },
    )
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
          <ExportButton
            filename="shops"
            sheetName="Shops"
            columns={shopColumns(viewShop, editShop)}
            loadRows={async () => {
              const rows = await fetchAllPages(getShops, { search: debouncedSearch, status, branchId: branch })
              return rows.map(mapShop)
            }}
          />
          <button
            type="button"
            onClick={() => navigate('/organization/shop/new')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
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
        <Stat label="Shops" value={summary?.shops?.total ?? shopsQuery.data?.meta?.total ?? '—'} />
        <Stat label="Active" value={summary?.shops?.active ?? '—'} />
        <Stat label="Branches" value={summary?.branches ?? '—'} />
        <Stat label="Assigned staff" value={summary?.assignedStaff ?? '—'} />
      </section>

      {tab === 'Shops' ? (
        <>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or code"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
              />
            </label>
            <select
              aria-label="Branch"
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              <option value="">All branches</option>
              {branchOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Status"
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
            <button type="button" onClick={clearFilters} className="cursor-pointer px-2 py-2 text-sm font-medium text-[#2f6fed] lg:ml-auto">
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
                  rowsPerPage={limit}
                  page={page}
                  totalCount={total}
                  onPageChange={setPage}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent={
                    shopsQuery.isError
                      ? shopsQuery.error.response?.data?.message || 'Could not load shops.'
                      : shopsQuery.isLoading
                        ? 'Loading shops...'
                        : 'No shops match these filters.'
                  }
                  summary={
                    total
                      ? `Showing ${pageRows.length} ${pageRows.length === 1 ? 'record' : 'records'}${selected ? ' · 1 selected' : ''}`
                      : undefined
                  }
                  onRowPress={selectShop}
                  rowClassName={(shop) => (selected?.id === shop.id ? 'row-soft' : 'hover:bg-slate-50')}
                />
              </section>

              <section className="rounded-2xl border border-[#d7e6ff] bg-[#eef4ff] px-5 py-4">
                <h2 className="text-sm font-semibold text-[#2f6fed]">Organization rules</h2>
                <p className="mt-1 text-[13px] leading-5 text-slate-500">{shopRule}</p>
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
                  rowsPerPage={limit}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent={
                    !selected
                      ? 'Select a shop to see assigned employees.'
                      : detailQuery.isLoading
                        ? 'Loading employees...'
                        : detailQuery.isError
                          ? detailQuery.error.response?.data?.message || 'Could not load assigned employees.'
                          : 'This shop has no assigned employees.'
                  }
                  summary={
                    employees.length
                      ? `Showing ${employees.length} ${employees.length === 1 ? 'record' : 'records'}${selectedEmployee ? ' · 1 selected' : ''}`
                      : undefined
                  }
                  onRowPress={(employee) => setEmployeeId(employee.id)}
                  rowClassName={(employee) => (selectedEmployee?.id === employee.id ? 'row-soft' : 'hover:bg-slate-50')}
                />
              </section>
            </div>

            {profile ? (
              <ShopDetail shop={profile} statusPending={updateStatus.isPending} onStatusChange={changeStatus} />
            ) : null}
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

function ShopDetail({ shop, statusPending, onStatusChange }) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-4">
      <h2 className="text-[18px] font-semibold text-slate-900">{display(shop.name)}</h2>
      <p className="mt-1 text-[13px] text-slate-400">{display(shop.code)}</p>
      <div className="mt-3">
        <StatusPill status={shop.status} />
      </div>
      <StatusSwitcher value={shop.statusValue} pending={statusPending} onChange={onStatusChange} />
      <p className="mt-4 text-[13px] leading-5 text-slate-500">{shop.summary}</p>
      <dl className="mt-5 space-y-3.5">
        <Fact label="Branch" value={display(shop.branch)} />
        <Fact label="Created on" value={shop.createdOn} />
        <Fact label="Updated" value={shop.updatedOn} />
        <Fact label="Record status" value={shop.status} />
      </dl>
      <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
        <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">{shopAccess}</p>
      </div>
    </aside>
  )
}

function StatusSwitcher({ value, pending, onChange }) {
  return (
    <div className="mt-4">
      <p className="text-[12px] font-medium text-slate-400">Shop status</p>
      <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        {shopStatuses.map((option) => {
          const selected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              disabled={pending}
              onClick={() => onChange(option.value)}
              className={`cursor-pointer rounded-lg px-1 py-1.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
                selected ? `${statusClassName(option.label)} shadow-sm` : 'text-slate-500 hover:bg-white'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
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
