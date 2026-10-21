import { Link, useNavigate, useParams } from 'react-router-dom'
import GlobalTable from '../../../components/GlobalTable.jsx'
import {
  allocationTotals,
  displayValue,
  mergePartnershipRegister,
  partnershipStats,
  partnerships as seedPartnerships,
  useAddedPartnerships,
  usePartnershipOverrides,
} from './partnershipRecords.js'
import { Fact, Stat } from './partnershipUi.jsx'
import { PartnershipAside } from './PartnershipPage.jsx'

const allocationColumns = [
  {
    key: 'name',
    label: 'PARTNER',
    isRowHeader: true,
    renderCell: (item) => <span className={`text-[13px] ${item.id === 'total' ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>{item.name}</span>,
  },
  { key: 'contribution', label: 'CONTRIBUTION', renderCell: (item) => <span className="text-[13px] text-slate-600">{item.contribution}</span> },
  { key: 'ownership', label: 'OWNERSHIP', renderCell: (item) => <span className="text-[13px] text-slate-600">{item.ownership}</span> },
  { key: 'profitShare', label: 'PROFIT SHARE', renderCell: (item) => <span className="text-[13px] text-slate-600">{item.profitShare}</span> },
  { key: 'lossShare', label: 'LOSS SHARE', renderCell: (item) => <span className="text-[13px] text-slate-600">{item.lossShare}</span> },
]

function ViewPartnershipPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const added = useAddedPartnerships()
  const overrides = usePartnershipOverrides()
  const register = mergePartnershipRegister(added, seedPartnerships, overrides)
  const record = register.find((item) => item.id === id || item.code === id) || null
  const stats = partnershipStats(register)

  if (!record) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Partnership not found</h1>
        <Link to="/organization/partnerships" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Partnerships
        </Link>
      </section>
    )
  }

  const totals = allocationTotals(record.partners)
  const allocations = [
    ...record.partners,
    { id: 'total', name: 'Total', contribution: totals.contribution, ownership: totals.ownership, profitShare: totals.profitShare, lossShare: totals.lossShare },
  ]

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
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">{record.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">{record.agreementType} agreement and profit sharing terms.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/organization/partnerships" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700">
            Back to Partnerships
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/organization/partnerships/${record.id}/edit`)}
            className="cursor-pointer rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Edit Partnership
          </button>
        </div>
      </div>

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
              <Fact label="Partnership name" value={record.name} />
              <Fact label="Agreement code" value={record.code} />
              <Fact label="Agreement type" value={record.agreementType} />
              <Fact label="Responsible branch" value={record.branch} />
              <Fact label="Start date" value={record.startDate} />
              <Fact label="End date" value={displayValue(record.endDate, 'Open')} />
              <Fact label="Effective date" value={displayValue(record.effectiveDate)} />
              <Fact label="Status" value={record.status} />
            </InfoGroup>
            <InfoGroup title="Participants and governance">
              <Fact label="Managing partner" value={displayValue(record.managingPartner)} />
              <Fact label="Review owner" value={displayValue(record.reviewOwner)} />
              <Fact label="Profit allocation owner" value={displayValue(record.profitOwner)} />
              <Fact label="Loss allocation owner" value={displayValue(record.lossOwner)} />
              <Fact label="Approval authority" value={displayValue(record.approvalAuthority)} />
            </InfoGroup>
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
              summary={`Showing ${record.partners.length} records`}
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
    </div>
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
