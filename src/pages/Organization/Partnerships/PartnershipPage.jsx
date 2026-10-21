import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ExportButton from '../../../components/ExportButton.jsx'
import GlobalTable from '../../../components/GlobalTable.jsx'
import {
  allocationTotals,
  displayValue,
  mergePartnershipRegister,
  partnershipAccess,
  partnershipRule,
  partnershipStats,
  partnerships as seedPartnerships,
  useAddedPartnerships,
  usePartnershipOverrides,
} from './partnershipRecords.js'
import { Fact, OrganizationTabs, Stat, StatusPill } from './partnershipUi.jsx'

const pageSize = 5

function partnershipColumns(onView, onEdit, selectedId) {
  return [
    {
      key: 'code',
      label: 'CODE',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.code}</span>,
    },
    {
      key: 'name',
      label: 'PARTNERSHIP',
      isRowHeader: true,
      renderCell: (item) => (
        <button type="button" onClick={() => onView(item)} className={`text-[13px] font-medium ${selectedId === item.id ? 'text-[#2f6fed]' : 'text-slate-800'}`}>
          {item.name}
        </button>
      ),
    },
    {
      key: 'agreementType',
      label: 'AGREEMENT TYPE',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{item.agreementType}</span>,
    },
    {
      key: 'startDate',
      label: 'START DATE',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{item.startDate}</span>,
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

const allocationColumns = [
  {
    key: 'name',
    label: 'PARTNER',
    isRowHeader: true,
    renderCell: (item) => <span className={`text-[13px] ${item.id === 'total' ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>{item.name}</span>,
  },
  {
    key: 'contribution',
    label: 'CONTRIBUTION',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.contribution}</span>,
  },
  {
    key: 'ownership',
    label: 'OWNERSHIP',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.ownership}</span>,
  },
  {
    key: 'profitShare',
    label: 'PROFIT SHARE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.profitShare}</span>,
  },
  {
    key: 'lossShare',
    label: 'LOSS SHARE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.lossShare}</span>,
  },
]

function PartnershipPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const added = useAddedPartnerships()
  const overrides = usePartnershipOverrides()
  const register = mergePartnershipRegister(added, seedPartnerships, overrides)
  const [query, setQuery] = useState('')
  const [branch, setBranch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || seedPartnerships[0].id)

  const branchOptions = [...new Set(register.map((item) => item.branch).filter(Boolean))]
  const needle = query.trim().toLowerCase()
  const filtered = register.filter((item) => {
    const matchesQuery = !needle || item.name.toLowerCase().includes(needle) || item.code.toLowerCase().includes(needle)
    const matchesBranch = !branch || item.branch === branch
    const matchesStatus = !status || item.status === status
    return matchesQuery && matchesBranch && matchesStatus
  })
  const start = (page - 1) * pageSize
  const pageRows = filtered.slice(start, start + pageSize)
  const selected = pageRows.find((item) => item.id === selectedId) || filtered.find((item) => item.id === selectedId) || pageRows[0] || null
  const totals = selected ? allocationTotals(selected.partners) : null
  const allocations = selected
    ? [...selected.partners, { id: 'total', name: 'Total', contribution: totals.contribution, ownership: totals.ownership, profitShare: totals.profitShare, lossShare: totals.lossShare }]
    : []
  const stats = partnershipStats(register)

  function viewPartnership(item) {
    navigate(`/organization/partnerships/${item.id}`)
  }

  function editPartnership(item) {
    navigate(`/organization/partnerships/${item.id}/edit`)
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
            rows={filtered}
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
          <option value="Draft">Draft</option>
          <option value="Review due">Review due</option>
          <option value="Inactive">Inactive</option>
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
              rowsPerPage={pageSize}
              page={page}
              totalCount={filtered.length}
              onPageChange={setPage}
              className="h-auto! max-h-none!"
              contentClassName="min-w-full"
              emptyContent="No partnerships match these filters."
              summary={
                filtered.length
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
              emptyContent={selected ? 'This partnership has no partners.' : 'Select a partnership to see allocations.'}
              summary={allocations.length ? `Showing ${selected?.partners.length || 0} records · 1 selected` : undefined}
            />
          </section>
        </div>

        {selected ? <PartnershipAside record={selected} /> : null}
      </div>
    </div>
  )
}

export function PartnershipAside({ record }) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-4">
      <h2 className="text-[18px] font-semibold text-slate-900">{record.name}</h2>
      <p className="mt-1 text-[13px] text-slate-400">{record.code}</p>
      <div className="mt-3">
        <StatusPill status={record.status} />
      </div>
      <p className="mt-4 text-[13px] leading-5 text-slate-500">{partnershipRule}</p>
      <dl className="mt-5 space-y-3.5">
        <Fact label="Governed by" value={displayValue(record.governedBy || record.managingPartner, '—')} />
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

export default PartnershipPage
