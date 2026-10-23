import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useBranches } from '../../../queries/branches/branches.queries.js'
import { useOwners } from '../../../queries/owners/owners.queries.js'
import { useCreatePartnership } from '../../../queries/partnerships/partnerships.queries.js'
import { PartnershipForm } from './PartnershipForm.jsx'
import {
  allocationsBalanced,
  applyPartnershipErrors,
  createdId,
  emptyPartner,
  partnershipAccess,
  partnershipRule,
  todayInput,
  toPartnershipBody,
  withOption,
} from './partnershipRecords.js'

const emptyForm = {
  name: '',
  code: '',
  agreementType: '',
  branch: '',
  endDate: '',
  effectiveDate: todayInput(),
  status: 'draft',
  distributionFrequency: '',
  capitalCommitment: '',
  managingPartner: '',
  reviewOwner: '',
  profitOwner: '',
  lossOwner: '',
  approvalAuthority: '',
  notes: '',
  partners: [emptyPartner()],
}

function validate(form, submit) {
  const nextErrors = {}
  if (!form.name.trim()) nextErrors.name = 'Enter a partnership name.'
  if (!form.code.trim()) nextErrors.code = 'Enter an agreement code.'
  if (!submit) return nextErrors

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

function AddPartnershipPage() {
  const navigate = useNavigate()
  const createPartnership = useCreatePartnership()
  const branchesQuery = useBranches({ page: 1, limit: 100, search: '', status: 'active' })
  const ownersQuery = useOwners({ page: 1, limit: 100, search: '', status: 'active', branchId: '' })
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const branchOptions = (branchesQuery.data?.data || []).map((branch) => ({
    value: branch._id,
    label: branch.name,
  }))
  const owners = ownersQuery.data?.data || []

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function save(submit) {
    const nextErrors = validate(form, submit)
    setErrors(nextErrors)
    if (createPartnership.isPending) return
    if (Object.keys(nextErrors).length) {
      toast.error(Object.values(nextErrors)[0])
      return
    }
    createPartnership.mutate(toPartnershipBody(form, form.status), {
      onSuccess: (data) => {
        const name = form.name.trim()
        const draft = form.status === 'draft'
        toast.success(data?.message || (draft ? `${name} saved as draft.` : `${name} submitted.`))
        const id = createdId(data)
        navigate('/organization/partnerships', { state: id ? { selectedId: id } : undefined })
      },
      onError: (error) => {
        applyPartnershipErrors(error, setErrors)
        toast.error(error.response?.data?.message || 'Could not save the partnership.')
      },
    })
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        save(true)
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <span>Organization</span>
            <span>/</span>
            <Link to="/organization/partnerships" className="hover:text-slate-700">
              Partnerships
            </Link>
            <span>/</span>
            <span className="text-slate-700">New</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Add Partnership</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Record the agreement, participants, contributions and profit sharing terms.
          </p>
        </div>
        <Link to="/organization/partnerships" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2f6fed]">
          <ArrowLeft size={15} />
          Back to Partnerships
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <PartnershipForm
            form={form}
            errors={errors}
            update={update}
            setPartners={(partners) => update('partners', partners)}
            branchOptions={withOption(branchOptions, form.branch)}
            owners={owners}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => navigate('/organization/partnerships')} className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              Cancel
            </button>
            <button
              type="button"
              disabled={createPartnership.isPending}
              onClick={() => save(false)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createPartnership.isPending ? 'Saving...' : 'Save as draft'}
            </button>
            <button
              type="submit"
              disabled={createPartnership.isPending}
              className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createPartnership.isPending ? 'Saving...' : 'Save and submit'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Required fields. {partnershipRule}
          </p>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Before you save</h2>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-500">Draft</span>
              <p className="text-sm font-medium text-slate-800">Create a record in this workspace</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-slate-500">{partnershipRule}</p>
          </section>
          <section className="rounded-2xl bg-[#eef4ff] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#2f6fed]">Access and relationships</h2>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{partnershipAccess}</p>
          </section>
        </aside>
      </div>
    </form>
  )
}

export default AddPartnershipPage
