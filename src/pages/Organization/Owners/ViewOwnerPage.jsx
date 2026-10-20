import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GlobalTable from '../../../components/GlobalTable.jsx'
import {
  formatMoney,
  formatPercent,
  formatPledged,
  mergeOwnerRegister,
  parseMoney,
  parseShare,
  useAddedOwners,
  useOwnerOverrides,
} from './ownerRecords.js'
import { owners as seedOwners } from './OwnerPage.jsx'

const statusClass = {
  Active: 'bg-[#e7f8ee] text-[#1f9d57]',
  Inactive: 'bg-[#eef1f4] text-[#8b95a5]',
}

const interestColumns = [
  {
    key: 'entity',
    label: 'ENTITY',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.entity}</span>,
  },
  {
    key: 'share',
    label: 'SHARE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.share}</span>,
  },
  {
    key: 'committed',
    label: 'COMMITTED',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.committed}</span>,
  },
  {
    key: 'paidIn',
    label: 'PAID IN',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.paidIn}</span>,
  },
  {
    key: 'effectiveDate',
    label: 'EFFECTIVE DATE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.effectiveDate}</span>,
  },
]

function display(value, empty = '—') {
  const text = String(value ?? '').trim()
  return text || empty
}

function totalInterest(register) {
  const interests = register.flatMap((owner) => owner.interests || [])
  const share = register.reduce((total, owner) => total + parseShare(owner.share), 0)
  const committed = interests.reduce((total, item) => total + parseMoney(item.committed), 0)
  const paidIn = interests.reduce((total, item) => total + parseMoney(item.paidIn), 0)
  return {
    id: 'total-allocated',
    entity: 'Total allocated',
    share: formatPercent(share),
    committed: formatMoney(committed),
    paidIn: formatMoney(paidIn),
    effectiveDate: 'Current',
  }
}

function ViewOwnerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addedOwners = useAddedOwners()
  const overrides = useOwnerOverrides()
  const register = mergeOwnerRegister(addedOwners, seedOwners, overrides)
  const owner = register.find((item) => item.id === id || item.code === id) || null
  const [interestId, setInterestId] = useState(owner?.interests?.[0]?.id || null)

  const interests = owner ? [...(owner.interests || []), totalInterest(register)] : []
  const selectedInterest = interests.find((item) => item.id === interestId) || interests[0] || null
  const activeCount = register.filter((item) => item.status === 'Active').length
  const shareTotal = register.reduce((total, item) => total + parseShare(item.share), 0)
  const pledged = register.reduce((total, item) => total + parseMoney(item.capitalCommitment), 0)

  if (!owner) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Owner not found</h1>
        <Link to="/organization/owners" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Owners
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
            <Link to="/organization/owners" className="hover:text-slate-700">
              Owners
            </Link>
            <span>/</span>
            <span className="text-slate-700">Detail</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">{owner.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Maintain owner identities, ownership interests, capital records and authorized signatories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/organization/owners" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700">
            Back to Owners
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/organization/owners/${owner.id}/edit`)}
            className="rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Edit Owner
          </button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Owners" value={register.length} />
        <Stat label="Active" value={activeCount} />
        <Stat label="Ownership allocated" value={formatPercent(shareTotal)} />
        <Stat label="Capital pledged" value={formatPledged(pledged)} />
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Owner information</h2>
            <p className="mt-0.5 text-sm text-slate-400">Profile, assignment and capital details</p>

            <DetailSection title="Owner identity">
              <Fact label="Owner name" value={owner.name} />
              <Fact label="Owner code" value={owner.code} />
              <Fact label="Owner type" value={display(owner.type)} />
              <Fact label="Identity / registration no." value={display(owner.identity)} />
            </DetailSection>

            <DetailSection title="Contact and address">
              <Fact label="Email" value={display(owner.email)} />
              <Fact label="Phone" value={display(owner.phone, 'Enter contact phone')} muted={!owner.phone} />
              <Fact label="Address" value={display(owner.address)} />
              <Fact label="Country" value={display(owner.country)} />
            </DetailSection>

            <DetailSection title="Ownership and authority" columns="xl:grid-cols-3">
              <Fact label="Ownership share" value={display(owner.share)} />
              <Fact label="Capital commitment" value={display(owner.capitalCommitment)} />
              <Fact label="Effective date" value={display(owner.effectiveDate)} />
              <Fact label="Capital account" value={display(owner.capitalAccount)} />
              <Fact label="Authorized signatory" value={display(owner.signatory)} />
              <Fact label="Status" value={owner.status} />
            </DetailSection>
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
              rowsPerPage={5}
              className="h-auto! max-h-none!"
              contentClassName="min-w-full"
              emptyContent="This owner has no capital interests."
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

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900">{owner.name}</h2>
          <p className="mt-1 text-[13px] text-slate-400">{owner.code}</p>
          <div className="mt-3">
            <StatusPill status={owner.status} />
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{owner.summary}</p>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Created by" value={display(owner.createdBy)} />
            <SideFact label="Created on" value={display(owner.createdOn)} />
            <SideFact label="Updated" value={display(owner.updatedOn)} />
            <SideFact label="Record status" value={owner.status} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{owner.access}</p>
          </div>
        </aside>
      </div>
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

export default ViewOwnerPage
