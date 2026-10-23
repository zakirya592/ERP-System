import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useBranches } from '../../../queries/branches/branches.queries.js'
import { useOwner, useUpdateOwner } from '../../../queries/owners/owners.queries.js'
import {
  allocationMessage,
  applyOwnerErrors,
  branchNameOf,
  formFromOwner,
  formatDate,
  ownerAccess,
  ownerStatuses,
  ownerSummary,
  ownerTypes,
  parseShare,
  statusClassName,
  toOwnerBody,
  withOption,
} from './ownerRecords.js'

function EditOwnerPage() {
  const { id } = useParams()
  const ownerQuery = useOwner(id)
  const owner = ownerQuery.data?.data

  if (ownerQuery.isLoading) {
    return <Message>Loading owner...</Message>
  }

  if (ownerQuery.isError) {
    return (
      <Message className="text-rose-500">
        {ownerQuery.error.response?.data?.message || 'Could not load this owner.'}
      </Message>
    )
  }

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

  return <EditOwnerForm key={owner._id} owner={owner} />
}

function EditOwnerForm({ owner }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const updateOwner = useUpdateOwner()
  const branchesQuery = useBranches({ page: 1, limit: 100, search: '', status: 'active' })
  const [form, setForm] = useState(() => formFromOwner(owner))
  const [errors, setErrors] = useState({})
  const allocated = owner.summary?.ownershipAllocated == null ? null : parseShare(owner.summary.ownershipAllocated)
  const branchOptions = withOption(
    (branchesQuery.data?.data || []).map((branch) => ({
      value: branch._id,
      label: branch.name,
    })),
    form.branchId,
    branchNameOf(owner),
  )
  const statusLabel = ownerStatuses.find((option) => option.value === form.status)?.label || form.status || 'Active'

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function validate() {
    const nextErrors = {}
    const share = parseShare(form.share)
    const others = allocated == null ? null : Math.max(0, allocated - parseShare(owner.ownershipPercentage))
    if (!form.name.trim()) nextErrors.name = 'Enter an owner name.'
    if (!form.code.trim()) nextErrors.code = 'Enter an owner code.'
    if (!form.ownerType) nextErrors.ownerType = 'Select an owner type.'
    if (!form.email.trim()) nextErrors.email = 'Enter an email.'
    if (!form.share.trim() || share <= 0) nextErrors.share = 'Enter an ownership share.'
    else if (share > 100) nextErrors.share = 'Ownership share cannot exceed 100%.'
    else if (others != null && others + share > 100) nextErrors.share = 'Effective ownership must total 100%.'
    if (form.email.trim() && !form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function save(event) {
    event.preventDefault()
    if (!validate()) return
    updateOwner.mutate(
      { id, ...toOwnerBody(form, owner.interests || []) },
      {
        onSuccess: (data) => {
          toast.success(data?.message || `${form.name.trim()} updated.`)
          navigate(`/organization/owners/`)
        },
        onError: (error) => {
          applyOwnerErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not update the owner.')
        },
      },
    )
  }

  return (
    <form className="space-y-4" onSubmit={save}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <span>Organization</span>
            <span>/</span>
            <Link to="/organization/owners" className="hover:text-slate-700">
              Owners
            </Link>
            <span>/</span>
            <span className="text-slate-700">Edit</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Edit Owner</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Maintain owner identities, ownership interests, capital records and authorized signatories.
          </p>
        </div>
        <Link to="/organization/owners" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700">
          Back to Owners
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <FormCard title="Owner identity">
            <Field label="Owner name" required value={form.name} error={errors.name} placeholder="Enter owner name" onChange={(value) => update('name', value)} />
            <Field label="Owner code" value={form.code} error={errors.code} placeholder="Enter owner code" onChange={(value) => update('code', value)} />
            <SelectField label="Owner type" required value={form.ownerType} error={errors.ownerType} placeholder="Select owner type" options={withOption(ownerTypes, form.ownerType, owner.ownerTypeLabel)} onChange={(value) => update('ownerType', value)} />
            <Field label="Identity / registration no." value={form.identityNo} error={errors.identityNo} placeholder="Enter identity / registration no." onChange={(value) => update('identityNo', value)} />
          </FormCard>

          <FormCard title="Contact and address">
            <Field label="Email" required type="email" value={form.email} error={errors.email} placeholder="Enter email" onChange={(value) => update('email', value)} />
            <Field label="Phone" value={form.phone} error={errors.phone} placeholder="Enter contact phone" onChange={(value) => update('phone', value)} />
            <Field label="Address" value={form.address} error={errors.address} placeholder="Enter address" onChange={(value) => update('address', value)} />
            <Field label="Country of registration" value={form.country} error={errors.country} placeholder="Enter country of registration" onChange={(value) => update('country', value)} />
            <SelectField label="Branch" value={form.branchId} error={errors.branchId} placeholder="Select branch" options={branchOptions} onChange={(value) => update('branchId', value)} />
          </FormCard>

          <FormCard title="Ownership and authority">
            <Field label="Ownership share" required value={form.share} error={errors.share} placeholder="Enter ownership share" onChange={(value) => update('share', value)} />
            <Field label="Capital commitment" value={form.capitalCommitment} error={errors.capitalCommitment} placeholder="Enter capital commitment" onChange={(value) => update('capitalCommitment', value)} />
            <Field label="Effective date" type="date" value={form.effectiveDate} error={errors.effectiveDate} onChange={(value) => update('effectiveDate', value)} />
            <Field label="Capital account" value={form.capitalAccount} error={errors.capitalAccount} placeholder="Enter capital account" onChange={(value) => update('capitalAccount', value)} />
            <Field label="Authorized signatory" value={form.signatory} error={errors.signatory} placeholder="Enter authorized signatory" onChange={(value) => update('signatory', value)} />
            <SelectField label="Status" value={form.status} error={errors.status} options={withOption(ownerStatuses, form.status, owner.statusLabel)} onChange={(value) => update('status', value)} />
            <div className="rounded-xl bg-[#eef4ff] px-4 py-3.5 md:col-span-2">
              <p className="text-[13px] font-semibold text-[#2f6fed]">Ownership validation</p>
              <p className="mt-1 text-[13px] leading-5 text-slate-600">
                {allocated == null ? ownerSummary : allocationMessage(allocated)}
              </p>
            </div>
          </FormCard>

          <FormCard title="Notes">
            <label className="block md:col-span-2">
              <span className="text-sm text-slate-700">Internal notes</span>
              <textarea
                value={form.notes}
                rows={3}
                placeholder="Add remarks for authorized workspace administrators"
                onChange={(event) => update('notes', event.target.value)}
                className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 ${
                  errors.notes ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.notes && <p className="mt-1 text-xs text-rose-500">{errors.notes}</p>}
            </label>
          </FormCard>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/organization/owners')}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateOwner.isPending}
              className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateOwner.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Required fields. {ownerSummary}
          </p>
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900">{form.name || owner.name}</h2>
          <p className="mt-1 text-[13px] text-slate-400">{form.code || owner.code}</p>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(statusLabel)}`}>
              {statusLabel}
            </span>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{ownerSummary}</p>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Branch" value={branchNameOf(owner) || '—'} />
            <SideFact label="Created on" value={formatDate(owner.createdAt)} />
            <SideFact label="Updated" value={formatDate(owner.updatedAt)} />
            <SideFact label="Record status" value={statusLabel} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{ownerAccess}</p>
          </div>
        </aside>
      </div>
    </form>
  )
}

function FormCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({ label, required = false, value, error, placeholder, type = 'text', onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 ${
          error ? 'border-rose-300' : 'border-slate-200'
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

function SelectField({ label, required = false, value, error, placeholder, options, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <span className="relative mt-1.5 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-8 text-sm outline-none focus:border-sky-400 ${
            error ? 'border-rose-300' : 'border-slate-200'
          } ${value ? 'text-slate-800' : 'text-slate-400'}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
      </span>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
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

function Message({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center text-sm font-semibold text-slate-900 shadow-sm ${className}`}>
      {children}
    </section>
  )
}

export default EditOwnerPage
