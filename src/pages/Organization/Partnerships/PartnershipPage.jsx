import { useEffect, useState } from 'react'
import { Eye, Pencil, Plus, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ExportButton from '../../../components/ExportButton.jsx'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { getPartnerships } from '../../../api/partnerships.api.js'
import { useBranches } from '../../../queries/branches/branches.queries.js'
import { usePartnership, usePartnerships, useUpdatePartnershipStatus } from '../../../queries/partnerships/partnerships.queries.js'
import { fetchAllPages } from '../../../utils/exportExcel.js'
import {
  display,
  mapPartnership,
  partnershipAccess,
  partnershipRule,
  partnershipStatuses,
  statusClassName,
  summaryStats,
} from './partnershipRecords.js'
import { Fact, OrganizationTabs, Stat, StatusPill } from './partnershipUi.jsx'

const limit = 20

const statusOptions = [{ label: 'All statuses', value: '' }, ...partnershipStatuses]

function partnershipColumns(onView, onEdit, selectedId) {
  return [
    {
      key: 'code',
      label: 'CODE',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{display(item.code)}</span>,
    },
    {
      key: 'name',
      label: 'PARTNERSHIP',
      isRowHeader: true,
      renderCell: (item) => (
        <button type="button" onClick={() => onView(item)} className={`text-[13px] font-medium ${selectedId === item.id ? 'text-[#2f6fed]' : 'text-slate-800'}`}>
          {display(item.name)}
        </button>
      ),
    },
    {
      key: 'agreementType',
      label: 'AGREEMENT TYPE',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.agreementType)}</span>,
    },
    {
      key: 'startDate',
      label: 'START DATE',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.startDate)}</span>,
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

const allocationColumns = [
  {
    key: 'name',
    label: 'PARTNER',
    isRowHeader: true,
    renderCell: (item) => <span className={`text-[13px] ${item.id === 'total' ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>{display(item.name)}</span>,
  },
  {
    key: 'contribution',
    label: 'CONTRIBUTION',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.contribution)}</span>,
  },
  {
    key: 'ownership',
    label: 'OWNERSHIP',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.ownership)}</span>,
  },
  {
    key: 'profitShare',
    label: 'PROFIT SHARE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.profitShare)}</span>,
  },
  {
    key: 'lossShare',
    label: 'LOSS SHARE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.lossShare)}</span>,
  },
]

function PartnershipPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [branch, setBranch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  const partnershipsQuery = usePartnerships({
    page,
    limit,
    search: debouncedSearch,
    status,
    branchId: branch,
  })
  const updateStatus = useUpdatePartnershipStatus()
  const branchesQuery = useBranches({ page: 1, limit: 100, search: '', status: 'active' })
  const pageRows = (partnershipsQuery.data?.data || []).map(mapPartnership)
  const total = partnershipsQuery.data?.meta?.total ?? pageRows.length
  const stats = summaryStats(partnershipsQuery.data?.meta?.summary)
  const selected = pageRows.find((item) => item.id === selectedId) || pageRows[0] || null
  const detailQuery = usePartnership(selected?.id)
  const detail = detailQuery.data?.data ? mapPartnership(detailQuery.data.data) : null
  const profile = detail || selected
  const allocations = profile?.allocations || []
  const branchOptions = (branchesQuery.data?.data || []).map((item) => ({
    id: item._id,
    name: item.name,
  }))

  function viewPartnership(item) {
    navigate(`/organization/partnerships/${item.id}`)
  }

  function editPartnership(item) {
    navigate(`/organization/partnerships/${item.id}/edit`)
  }

  function changeStatus(nextStatus) {
    if (!profile?.id || profile.statusValue === nextStatus || updateStatus.isPending) return
    updateStatus.mutate(
      { id: profile.id, status: nextStatus },
      {
        onSuccess: (data) => {
          const label = partnershipStatuses.find((option) => option.value === nextStatus)?.label || nextStatus
          toast.success(data?.message || `${profile.name || 'Partnership'} is now ${label}.`)
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Could not update the partnership status.')
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
            <span className="text-slate-700">Partnerships</span>
            <span>/</span>
            <span>Register</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Partnerships</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage partnership agreements, participants, contributions and profit sharing terms.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            filename="partnerships"
            sheetName="Partnerships"
            columns={partnershipColumns(viewPartnership, editPartnership, selected?.id)}
            loadRows={async () => {
              const rows = await fetchAllPages(getPartnerships, { search: debouncedSearch, status, branchId: branch })
              return rows.map(mapPartnership)
            }}
          />
          <button
            type="button"
            onClick={() => navigate('/organization/partnerships/new')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            <Plus size={15} />
            Add Partnership
          </button>
        </div>
      </div>

      <OrganizationTabs />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Agreements" value={stats.agreements} />
        <Stat label="Active" value={stats.active} />
        <Stat label="Review due" value={stats.reviewDue} />
        <Stat label="Active partners" value={stats.activePartners} />
      </section>

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
          {branchOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
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
              <h2 className="text-sm font-semibold text-slate-900">Partnerships register</h2>
            </div>
            <GlobalTable
              ariaLabel="Partnerships register"
              columns={partnershipColumns(viewPartnership, editPartnership, selected?.id)}
              data={pageRows}
              pagination
              rowsPerPage={limit}
              page={page}
              totalCount={total}
              onPageChange={setPage}
              className="h-auto! max-h-none!"
              contentClassName="min-w-full"
              emptyContent={
                partnershipsQuery.isError
                  ? partnershipsQuery.error.response?.data?.message || 'Could not load partnerships.'
                  : partnershipsQuery.isLoading
                    ? 'Loading partnerships...'
                    : 'No partnerships match these filters.'
              }
              summary={
                total
                  ? `Showing ${pageRows.length} ${pageRows.length === 1 ? 'record' : 'records'}${selected ? ' · 1 selected' : ''}`
                  : undefined
              }
              onRowPress={(item) => setSelectedId(item.id)}
              rowClassName={(item) => (selected?.id === item.id ? 'row-soft' : 'hover:bg-slate-50')}
            />
          </section>

          <section className="rounded-2xl border border-[#d7e6ff] bg-[#eef4ff] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#2f6fed]">Organization rules</h2>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">{partnershipRule}</p>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="px-5 pt-4">
              <h2 className="text-sm font-semibold text-slate-900">Partners and allocations</h2>
            </div>
            <GlobalTable
              ariaLabel="Partners and allocations"
              columns={allocationColumns}
              data={allocations}
              className="h-auto! max-h-none!"
              contentClassName="min-w-full"
              emptyContent={
                !selected
                  ? 'Select a partnership to see allocations.'
                  : detailQuery.isLoading
                    ? 'Loading allocations...'
                    : detailQuery.isError
                      ? detailQuery.error.response?.data?.message || 'Could not load allocations.'
                      : 'This partnership has no partners.'
              }
              summary={
                profile?.partners?.length
                  ? `Showing ${profile.partners.length} ${profile.partners.length === 1 ? 'record' : 'records'}`
                  : undefined
              }
            />
          </section>
        </div>

        {profile ? (
          <PartnershipAside record={profile} statusPending={updateStatus.isPending} onStatusChange={changeStatus} />
        ) : null}
      </div>
    </div>
  )
}

export function PartnershipAside({ record, statusPending = false, onStatusChange }) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-4">
      <h2 className="text-[18px] font-semibold text-slate-900">{display(record.name)}</h2>
      <p className="mt-1 text-[13px] text-slate-400">{display(record.code)}</p>
      <div className="mt-3">
        <StatusPill status={record.status} />
      </div>
      {onStatusChange ? <StatusSwitcher value={record.statusValue} pending={statusPending} onChange={onStatusChange} /> : null}
      <p className="mt-4 text-[13px] leading-5 text-slate-500">{partnershipRule}</p>
      <dl className="mt-5 space-y-3.5">
        <Fact label="Governed by" value={display(record.governedBy || record.managingPartner)} />
        <Fact label="Created on" value={record.createdOn} />
        <Fact label="Updated" value={record.updatedOn} />
        <Fact label="Record status" value={record.status} />
      </dl>
      <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
        <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">{partnershipAccess}</p>
      </div>
    </aside>
  )
}

function StatusSwitcher({ value, pending, onChange }) {
  return (
    <div className="mt-4">
      <p className="text-[12px] font-medium text-slate-400">Partnership status</p>
      <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        {partnershipStatuses.map((option) => {
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

export default PartnershipPage
