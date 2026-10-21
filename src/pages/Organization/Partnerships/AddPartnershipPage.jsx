import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PartnershipForm } from './PartnershipForm.jsx'
import {
  addPartnershipRecord,
  allocationsBalanced,
  emptyPartner,
  formatMoney,
  formatShare,
  formatDisplayDate,
  nextPartnershipCode,
  parseMoney,
  partnershipAccess,
  partnershipCodeTaken,
  partnershipRule,
  todayInput,
} from './partnershipRecords.js'
const emptyForm = {
  name: '',
  code: '',
  agreementType: '',
  branch: '',
  startDate: '',
  endDate: '',
  effectiveDate: todayInput(),
  status: 'Draft',
  profitBasis: '',
  lossBasis: '',
  reviewCycle: '',
  distributionFrequency: '',
  capitalCommitment: '',
  minimumContribution: '',
  managingPartner: '',
  reviewOwner: '',
  profitOwner: '',
  lossOwner: '',
  approvalAuthority: '',
  documentReference: '',
  fileName: '',
  notes: '',
  partners: [emptyPartner()],
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

function toRecord(form, status) {
  const code = form.code.trim() || nextPartnershipCode()
  const today = formatToday()
  return {
    id: code,
    code,
    name: form.name.trim(),
    agreementType: form.agreementType,
    branch: form.branch,
    startDate: formatDisplayDate(form.effectiveDate) || formatDisplayDate(form.startDate),
    endDate: formatDisplayDate(form.endDate),
    effectiveDate: formatDisplayDate(form.effectiveDate),
    status,
    profitBasis: form.profitBasis,
    lossBasis: form.lossBasis,
    reviewCycle: form.reviewCycle,
    distributionFrequency: form.distributionFrequency,
    capitalCommitment: form.capitalCommitment.trim() ? formatMoney(parseMoney(form.capitalCommitment)) : '',
    minimumContribution: form.minimumContribution.trim() ? formatMoney(parseMoney(form.minimumContribution)) : '',
    managingPartner: form.managingPartner,
    reviewOwner: form.reviewOwner,
    profitOwner: form.profitOwner,
    lossOwner: form.lossOwner,
    approvalAuthority: form.approvalAuthority,
    partners: form.partners
      .filter((row) => row.name || row.contribution || row.ownership)
      .map((row) => ({
        ...row,
        contribution: row.contribution ? formatMoney(parseMoney(row.contribution)) : '',
        ownership: formatShare(row.ownership),
        profitShare: formatShare(row.profitShare),
        lossShare: formatShare(row.lossShare),
      })),
    documentReference: form.documentReference.trim(),
    fileName: form.fileName.trim(),
    notes: form.notes.trim(),
    governedBy: form.managingPartner,
    createdOn: today,
    updatedOn: today,
  }
}

function validate(form, submit) {
  const nextErrors = {}
  if (!form.name.trim()) nextErrors.name = 'Enter a partnership name.'
  if (!form.code.trim()) nextErrors.code = 'Enter an agreement code.'
  else if (partnershipCodeTaken(form.code)) nextErrors.code = 'This agreement code is already in use.'
  if (!submit) return nextErrors

  if (!form.agreementType) nextErrors.agreementType = 'Select an agreement type.'
  if (!form.branch) nextErrors.branch = 'Select a branch.'
  if (!form.effectiveDate.trim()) nextErrors.effectiveDate = 'Enter an effective date.'
  if (!form.managingPartner) nextErrors.managingPartner = 'Select a managing partner.'
  if (!form.reviewOwner) nextErrors.reviewOwner = 'Select a review owner.'
  if (!form.profitOwner) nextErrors.profitOwner = 'Select a profit allocation owner.'
  if (!form.lossOwner) nextErrors.lossOwner = 'Select a loss allocation owner.'
  if (!form.approvalAuthority) nextErrors.approvalAuthority = 'Select an approval authority.'
  if (!form.fileName) nextErrors.fileName = 'Upload the signed partnership agreement.'
  const rows = form.partners.filter((row) => row.name)
  if (!rows.length || rows.some((row) => !row.contribution || !row.ownership || !row.profitShare || !row.lossShare)) {
    nextErrors.partners = 'Enter each partner, contribution, and share.'
  } else if (!allocationsBalanced(rows)) {
    nextErrors.partners = 'Each allocation column must total 100%.'
  }
  return nextErrors
}

function AddPartnershipPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function save(submit) {
    const nextErrors = validate(form, submit)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const status = submit ? 'Active' : 'Draft'
    const record = addPartnershipRecord(toRecord(form, status))
    toast.success(submit ? `${record.name} submitted.` : `${record.name} saved as draft.`)
    navigate('/organization/partnerships', { state: { selectedId: record.id } })
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
          <PartnershipForm form={form} errors={errors} update={update} setPartners={(partners) => update('partners', partners)} />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => navigate('/organization/partnerships')} className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              Cancel
            </button>
            <button type="button" onClick={() => save(false)} className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              Save as draft
            </button>
            <button type="submit" className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white">
              Save and submit
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
