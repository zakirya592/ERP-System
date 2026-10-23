import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useBranches } from '../../../queries/branches/branches.queries.js'
import { useOwners } from '../../../queries/owners/owners.queries.js'
import { usePartnership, useUpdatePartnership } from '../../../queries/partnerships/partnerships.queries.js'
import { PartnershipForm } from './PartnershipForm.jsx'
import {
  allocationsBalanced,
  applyPartnershipErrors,
  branchNameOf,
  display,
  formFromPartnership,
  formatDate,
  partnershipAccess,
  partnershipRule,
  statusText,
  toPartnershipBody,
  withOption,
} from './partnershipRecords.js'
import { StatusPill } from './partnershipUi.jsx'

function validate(form) {
  const nextErrors = {}
  if (!form.name.trim()) nextErrors.name = 'Enter a partnership name.'
  if (!form.code.trim()) nextErrors.code = 'Enter an agreement code.'
  if (!form.agreementType) nextErrors.agreementType = 'Select an agreement type.'
  if (!form.branch) nextErrors.branch = 'Select a branch.'
  if (!form.effectiveDate.trim()) nextErrors.effectiveDate = 'Enter an effective date.'
  if (!form.managingPartner) nextErrors.managingPartner = 'Select a managing partner.'
  if (!form.reviewOwner) nextErrors.reviewOwner = 'Select a review owner.'
  if (!form.profitOwner) nextErrors.profitOwner = 'Select a profit allocation owner.'
  if (!form.lossOwner) nextErrors.lossOwner = 'Select a loss allocation owner.'
  if (!form.approvalAuthority) nextErrors.approvalAuthority = 'Select an approval authority.'
  const rows = form.partners.filter((row) => row.ownerId)
  if (!rows.length || rows.some((row) => !row.contribution || !row.ownership || !row.profitShare || !row.lossShare)) {
    nextErrors.partners = 'Enter each partner, contribution, and share.'
  } else if (!allocationsBalanced(rows)) {
    nextErrors.partners = 'Each allocation column must total 100%.'
  }
  return nextErrors
}

function EditPartnershipPage() {
  const { id } = useParams()
  const partnershipQuery = usePartnership(id)
  const record = partnershipQuery.data?.data

  if (partnershipQuery.isLoading) {
    return <Message>Loading partnership...</Message>
  }

  if (partnershipQuery.isError) {
    return <Message className="text-rose-500">{partnershipQuery.error.response?.data?.message || 'Could not load this partnership.'}</Message>
  }

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

  return <EditPartnershipForm key={record._id} record={record} />
}

function EditPartnershipForm({ record }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const updatePartnership = useUpdatePartnership()
  const branchesQuery = useBranches({ page: 1, limit: 100, search: '', status: 'active' })
  const ownersQuery = useOwners({ page: 1, limit: 100, search: '', status: 'active', branchId: '' })
  const [form, setForm] = useState(() => formFromPartnership(record))
  const [errors, setErrors] = useState({})
  const branchOptions = withOption(
    (branchesQuery.data?.data || []).map((branch) => ({
      value: branch._id,
      label: branch.name,
    })),
    form.branch,
    branchNameOf(record),
  )
  const owners = ownersQuery.data?.data || []

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function save(event) {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (updatePartnership.isPending) return
    if (Object.keys(nextErrors).length) {
      toast.error(Object.values(nextErrors)[0])
      return
    }
    updatePartnership.mutate(
      { id, ...toPartnershipBody(form, form.status) },
      {
        onSuccess: (data) => {
          toast.success(data?.message || `${form.name.trim()} updated.`)
          navigate(`/organization/partnerships`)
        },
        onError: (error) => {
          applyPartnershipErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not update the partnership.')
        },
      },
    )
  }

  return (
    <form className="space-y-4" onSubmit={save}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <span>Organization</span>
            <span>/</span>
            <Link to="/organization/partnerships" className="hover:text-slate-700">
              Partnerships
            </Link>
            <span>/</span>
            <span className="text-slate-700">Edit</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Edit Partnership</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Update the agreement, participants, contributions and profit sharing terms.
          </p>
        </div>
        <Link to={`/organization/partnerships/${id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2f6fed]">
          <ArrowLeft size={15} />
          Back to Partnership
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <PartnershipForm
            form={form}
            errors={errors}
            update={update}
            setPartners={(partners) => update('partners', partners)}
            branchOptions={branchOptions}
            owners={owners}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => navigate(`/organization/partnerships/${id}`)} className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatePartnership.isPending}
              className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updatePartnership.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Required fields. {partnershipRule}
          </p>
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900">{display(record.name)}</h2>
          <p className="mt-1 font-mono text-[13px] text-slate-400">{display(record.code)}</p>
          <div className="mt-3">
            <StatusPill status={statusText(record)} />
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{partnershipRule}</p>
          <dl className="mt-5 space-y-3.5 text-sm">
            <div>
              <dt className="text-slate-400">Governed by</dt>
              <dd className="font-medium text-slate-800">{display(record.managingPartner)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Created on</dt>
              <dd className="font-medium text-slate-800">{formatDate(record.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Updated</dt>
              <dd className="font-medium text-slate-800">{formatDate(record.updatedAt)}</dd>
            </div>
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{partnershipAccess}</p>
          </div>
        </aside>
      </div>
    </form>
  )
}

function Message({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center text-sm font-semibold shadow-sm ${className}`}>
      {children}
    </section>
  )
}

export default EditPartnershipPage
