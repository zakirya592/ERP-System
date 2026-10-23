import { Link, useNavigate, useParams } from 'react-router-dom'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { usePartnership } from '../../../queries/partnerships/partnerships.queries.js'
import { display, mapPartnership, summaryStats } from './partnershipRecords.js'
import { Fact, Stat } from './partnershipUi.jsx'
import { PartnershipAside } from './PartnershipPage.jsx'

const allocationColumns = [
  {
    key: 'name',
    label: 'PARTNER',
    isRowHeader: true,
    renderCell: (item) => <span className={`text-[13px] ${item.id === 'total' ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>{display(item.name)}</span>,
  },
  { key: 'contribution', label: 'CONTRIBUTION', renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.contribution)}</span> },
  { key: 'ownership', label: 'OWNERSHIP', renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.ownership)}</span> },
  { key: 'profitShare', label: 'PROFIT SHARE', renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.profitShare)}</span> },
  { key: 'lossShare', label: 'LOSS SHARE', renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.lossShare)}</span> },
]

function ViewPartnershipPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const partnershipQuery = usePartnership(id)
  const record = partnershipQuery.data?.data ? mapPartnership(partnershipQuery.data.data) : null
  const stats = summaryStats(partnershipQuery.data?.data?.summary)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <span>Organization</span>
            <span>/</span>
            <Link to="/organization/partnerships" className="hover:text-slate-700">
              Partnerships
            </Link>
            <span>/</span>
            <span className="text-slate-700">Detail</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">{record?.name || 'Partnership'}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            {record ? `${record.agreementType} agreement and profit sharing terms.` : 'Agreement and profit sharing terms.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/organization/partnerships" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700">
            Back to Partnerships
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/organization/partnerships/${id}/edit`)}
            className="cursor-pointer rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Edit Partnership
          </button>
        </div>
      </div>

      {partnershipQuery.isLoading && <Panel>Loading partnership...</Panel>}
      {partnershipQuery.isError && (
        <Panel className="text-rose-500">{partnershipQuery.error.response?.data?.message || 'Could not load this partnership.'}</Panel>
      )}

      {record && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Agreements" value={stats.agreements} />
            <Stat label="Active" value={stats.active} />
            <Stat label="Review due" value={stats.reviewDue} />
            <Stat label="Active partners" value={stats.activePartners} />
          </section>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">Partnership information</h2>
                <InfoGroup title="Agreement information">
                  <Fact label="Partnership name" value={display(record.name)} />
                  <Fact label="Agreement code" value={display(record.code)} />
                  <Fact label="Agreement type" value={display(record.agreementType)} />
                  <Fact label="Responsible branch" value={display(record.branch)} />
                  <Fact label="Start date" value={display(record.startDate)} />
                  <Fact label="End / review date" value={display(record.endDate, 'Open')} />
                  <Fact label="Effective date" value={display(record.effectiveDate)} />
                  <Fact label="Capital commitment" value={display(record.capitalCommitment)} />
                  <Fact label="Settlement frequency" value={display(record.settlementFrequency)} />
                  <Fact label="Status" value={display(record.status)} />
                </InfoGroup>
                <InfoGroup title="Participants and governance">
                  <Fact label="Managing partner" value={display(record.managingPartner)} />
                  <Fact label="Review owner" value={display(record.reviewOwner)} />
                  <Fact label="Profit allocation owner" value={display(record.profitOwner)} />
                  <Fact label="Loss allocation owner" value={display(record.lossOwner)} />
                  <Fact label="Approval authority" value={display(record.approvalAuthority)} />
                  <Fact label="Notes" value={display(record.notes)} />
                </InfoGroup>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="px-5 pt-4">
                  <h2 className="text-sm font-semibold text-slate-900">Partners and allocations</h2>
                </div>
                <GlobalTable
                  ariaLabel="Partners and allocations"
                  columns={allocationColumns}
                  data={record.allocations}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent="This partnership has no partners."
                  summary={record.partners.length ? `Showing ${record.partners.length} ${record.partners.length === 1 ? 'record' : 'records'}` : undefined}
                />
              </section>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/organization/partnerships/${record.id}/edit`)}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Edit Agreement
                </button>
                <Link to="/organization/owners" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  View Owners
                </Link>
              </div>
            </div>
            <PartnershipAside record={record} />
          </div>
        </>
      )}
    </div>
  )
}

function Panel({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center text-sm font-semibold shadow-sm ${className}`}>
      {children}
    </section>
  )
}

function InfoGroup({ title, children }) {
  return (
    <div className="mt-5">
      <h3 className="text-[13px] font-semibold text-slate-800">{title}</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  )
}

export default ViewPartnershipPage
