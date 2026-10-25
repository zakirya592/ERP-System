import { useEffect, useState } from 'react'
import { Eye, Pencil, Plus, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ExportButton from '../../../components/ExportButton.jsx'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { getOwners } from '../../../api/owners.api.js'
import { useBranches } from '../../../queries/branches/branches.queries.js'
import { useOwner, useOwners, useUpdateOwnerStatus } from '../../../queries/owners/owners.queries.js'
import { fetchAllPages } from '../../../utils/exportExcel.js'
import {
  display,
  formatPercent,
  formatPledged,
  mapOwner,
  ownerStatuses,
  ownerSummary,
  statusClassName,
} from './ownerRecords.js'

const limit = 10

const tabs = ['Branches', 'Shops', 'Warehouses', 'Employees', 'Owners', 'Partnerships']

const tabRoutes = {
  Branches: '/organization/branches',
  Shops: '/organization/shop',
  Warehouses: '/organization/warehouses',
  Employees: '/organization/employees',
  Partnerships: '/organization/partnerships',
}

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(status)}`}>
      {status}
    </span>
  )
}

function ownerColumns(onView, onEdit) {
  return [
    {
      key: 'code',
      label: 'CODE',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{display(item.code)}</span>,
    },
    {
      key: 'name',
      label: 'OWNER',
      isRowHeader: true,
      renderCell: (item) => (
        <button type="button" onClick={() => onView(item)} className="text-[13px] font-medium text-slate-800">
          {display(item.name)}
        </button>
      ),
    },
    {
      key: 'type',
      label: 'TYPE',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.type)}</span>,
    },
    {
      key: 'share',
      label: 'OWNERSHIP',
      renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{display(item.share)}</span>,
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
            aria-label={`Edit ${item.name}`}
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

const interestColumns = [
  {
    key: 'entity',
    label: 'ENTITY',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{display(item.entity)}</span>,
  },
  {
    key: 'share',
    label: 'SHARE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.share)}</span>,
  },
  {
    key: 'committed',
    label: 'COMMITTED',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.committed)}</span>,
  },
  {
    key: 'paidIn',
    label: 'PAID IN',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.paidIn)}</span>,
  },
  {
    key: 'effectiveDate',
    label: 'EFFECTIVE DATE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.effectiveDate)}</span>,
  },
]

function OwnerPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState('Owners')
  const [query, setQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [branch, setBranch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || null)
  const [interestId, setInterestId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, branch])

  const updateStatus = useUpdateOwnerStatus()
  const ownersQuery = useOwners({
    page,
    limit,
    search: debouncedSearch,
    status,
    branchId: branch,
  })
  const branchesQuery = useBranches({ page: 1, limit: 100, search: '', status: 'active' })
  const pageRows = (ownersQuery.data?.data || []).map(mapOwner)
  const total = ownersQuery.data?.meta?.total ?? pageRows.length
  const summary = ownersQuery.data?.meta?.summary || ownersQuery.data?.data?.[0]?.summary
  const selected = pageRows.find((owner) => owner.id === selectedId) || pageRows[0] || null

  useEffect(() => {
    if (selectedId && pageRows.some((owner) => owner.id === selectedId)) return
    if (pageRows[0]) setSelectedId(pageRows[0].id)
  }, [pageRows, selectedId])

  const detailQuery = useOwner(selected?.id)
  const detail = detailQuery.data?.data ? mapOwner(detailQuery.data.data) : null
  const profile = detail || selected
  const interests = profile?.interests || []
  const selectedInterest = interests.find((item) => item.id === interestId) || interests[0] || null
  const branchOptions = (branchesQuery.data?.data || []).map((item) => ({
    id: item._id,
    name: item.name,
  }))
  const ownerTotal = summary?.owners?.total ?? ownersQuery.data?.meta?.total ?? '—'
  const activeCount = summary?.owners?.active ?? '—'
  const shareTotal = summary ? formatPercent(summary.ownershipAllocated) : '—'
  const pledged = summary ? formatPledged(summary.capitalPledged) : '—'

  function openTab(item) {
    const route = tabRoutes[item]
    if (route) {
      navigate(route)
      return
    }
    setTab(item)
  }

  function selectOwner(owner) {
    setSelectedId(owner.id)
    setInterestId(owner.interests[0]?.id || null)
  }

  function viewOwner(owner) {
    navigate(`/organization/owners/${owner.id}`)
  }

  function editOwner(owner) {
    navigate(`/organization/owners/${owner.id}/edit`)
  }

  function changeStatus(nextStatus) {
    if (!profile?.id || profile.statusValue === nextStatus || updateStatus.isPending) return
    updateStatus.mutate(
      { id: profile.id, status: nextStatus },
      {
        onSuccess: (data) => {
          const label = ownerStatuses.find((option) => option.value === nextStatus)?.label || nextStatus
          toast.success(data?.message || `${profile.name || 'Owner'} is now ${label}.`)
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Could not update the owner status.')
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
              Organization
            </Link>
            <span>/</span>
            <span className="text-slate-700">Owners</span>
            <span>/</span>
            <span>Register</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Owners</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Maintain owner identities, ownership interests, capital records and authorized signatories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            filename="owners"
            sheetName="Owners"
            columns={ownerColumns(viewOwner, editOwner)}
            loadRows={async () => {
              const rows = await fetchAllPages(getOwners, { search: debouncedSearch, status, branchId: branch })
              return rows.map(mapOwner)
            }}
          />
          <button
            type="button"
            onClick={() => navigate('/organization/owners/new')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            <Plus size={15} />
            Add Owner
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
                ? 'cursor-pointer rounded-lg bg-[#e8f1ff] px-3 py-1.5 text-sm font-medium text-[#2f6fed] shadow-sm'
                : 'cursor-pointer rounded-lg bg-white px-3 py-1.5 text-sm text-slate-500 shadow-sm hover:bg-white'
            }
          >
            {item}
          </button>
        ))}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Owners" value={ownerTotal} />
        <Stat label="Active" value={activeCount} />
        <Stat label="Ownership allocated" value={shareTotal} />
        <Stat label="Capital pledged" value={pledged} />
      </section>

      {tab === 'Owners' ? (
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
                  <h2 className="text-sm font-semibold text-slate-900">Owners register</h2>
                </div>
                <GlobalTable
                  ariaLabel="Owners register"
                  columns={ownerColumns(viewOwner, editOwner)}
                  data={pageRows}
                  pagination
                  rowsPerPage={limit}
                  page={page}
                  totalCount={total}
                  onPageChange={setPage}
                  contentClassName="min-w-full"
                  emptyContent={
                    ownersQuery.isError
                      ? ownersQuery.error.response?.data?.message || 'Could not load owners.'
                      : ownersQuery.isLoading
                        ? 'Loading owners...'
                        : 'No owners match these filters.'
                  }
                  summary={
                    total
                      ? `Showing ${pageRows.length} ${pageRows.length === 1 ? 'record' : 'records'}${selected ? ' · 1 selected' : ''}`
                      : undefined
                  }
                  onRowPress={selectOwner}
                  rowClassName={(owner) => (selected?.id === owner.id ? 'row-soft' : 'hover:bg-slate-50')}
                />
              </section>

              <section className="rounded-2xl border border-[#d7e6ff] bg-[#eef4ff] px-5 py-4">
                <h2 className="text-sm font-semibold text-[#2f6fed]">Organization rules</h2>
                <p className="mt-1 text-[13px] leading-5 text-slate-500">{ownerSummary}</p>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="px-5 pt-4">
                  <h2 className="text-sm font-semibold text-slate-900">Ownership and capital interests</h2>
                </div>
                <GlobalTable
                  ariaLabel="Ownership and capital interests"
                  columns={interestColumns}
                  data={interests}
                  pagination
                  rowsPerPage={limit}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent={
                    !selected
                      ? 'Select an owner to see capital interests.'
                      : detailQuery.isLoading
                        ? 'Loading interests...'
                        : detailQuery.isError
                          ? detailQuery.error.response?.data?.message || 'Could not load interests.'
                          : 'This owner has no capital interests.'
                  }
                  summary={
                    interests.length
                      ? `Showing ${interests.length} ${interests.length === 1 ? 'record' : 'records'}${selectedInterest ? ' · 1 selected' : ''}`
                      : undefined
                  }
                  onRowPress={(interest) => setInterestId(interest.id)}
                  rowClassName={(interest) => (selectedInterest?.id === interest.id ? 'row-soft' : 'hover:bg-slate-50')}
                />
              </section>
            </div>

            {profile ? (
              <OwnerDetail owner={profile} statusPending={updateStatus.isPending} onStatusChange={changeStatus} />
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

function OwnerDetail({ owner, statusPending, onStatusChange }) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-4">
      <h2 className="text-[18px] font-semibold text-slate-900">{display(owner.name)}</h2>
      <p className="mt-1 text-[13px] text-slate-400">{display(owner.code)}</p>
      <div className="mt-3">
        <StatusPill status={owner.status} />
      </div>
      <StatusSwitcher value={owner.statusValue} pending={statusPending} onChange={onStatusChange} />
      <p className="mt-4 text-[13px] leading-5 text-slate-500">{owner.summary}</p>
      <dl className="mt-5 space-y-3.5">
        <Fact label="Branch" value={display(owner.branch)} />
        <Fact label="Capital commitment" value={display(owner.capitalCommitment)} />
        <Fact label="Created on" value={owner.createdOn} />
        <Fact label="Updated" value={owner.updatedOn} />
        <Fact label="Record status" value={owner.status} />
      </dl>
      <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
        <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">{owner.access}</p>
      </div>
    </aside>
  )
}

function StatusSwitcher({ value, pending, onChange }) {
  return (
    <div className="mt-4">
      <p className="text-[12px] font-medium text-slate-400">Owner status</p>
      <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        {ownerStatuses.map((option) => {
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

export default OwnerPage
