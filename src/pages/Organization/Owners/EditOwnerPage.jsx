import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  allocatedShare,
  allocationMessage,
  buildInterests,
  formatShare,
  mergeOwnerRegister,
  ownerCodeTaken,
  ownerStatuses,
  ownerSummary,
  ownerTypes,
  parseShare,
  updateOwnerRecord,
  useAddedOwners,
  useOwnerOverrides,
} from './ownerRecords.js'
import { owners as seedOwners } from './OwnerPage.jsx'

const statusClass = {
  Active: 'bg-[#e7f8ee] text-[#1f9d57]',
  Inactive: 'bg-[#eef1f4] text-[#8b95a5]',
}

function withCurrent(options, current) {
  const value = String(current || '').trim()
  if (!value || options.includes(value)) return options
  return [value, ...options]
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

function fileKind(name) {
  const extension = String(name).split('.').pop()?.toUpperCase()
  if (!extension || extension === String(name).toUpperCase()) return 'FILE'
  if (extension === 'JPEG') return 'JPG'
  return extension
}

function formFromOwner(owner) {
  return {
    name: owner.name || '',
    code: owner.code || '',
    type: owner.type || '',
    identity: owner.identity || '',
    email: owner.email || '',
    phone: owner.phone || '',
    address: owner.address || '',
    country: owner.country || '',
    share: owner.share || '',
    capitalCommitment: owner.capitalCommitment || '',
    effectiveDate: owner.effectiveDate || '',
    capitalAccount: owner.capitalAccount || '',
    signatory: owner.signatory || '',
    status: owner.status || 'Active',
    documentType: owner.documentType || '',
    documentReference: owner.documentReference || '',
    fileName: owner.fileName || '',
    notes: owner.notes || '',
  }
}

function toUpdatedOwner(owner, form) {
  const share = formatShare(form.share)
  return {
    ...owner,
    code: form.code.trim(),
    name: form.name.trim(),
    type: form.type,
    identity: form.identity.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    country: form.country.trim(),
    share,
    capitalCommitment: form.capitalCommitment.trim(),
    effectiveDate: form.effectiveDate.trim(),
    capitalAccount: form.capitalAccount.trim(),
    signatory: form.signatory.trim(),
    status: form.status || 'Active',
    documentType: form.documentType.trim(),
    documentReference: form.documentReference.trim(),
    fileName: form.fileName.trim(),
    notes: form.notes.trim(),
    updatedOn: formatToday(),
    interests: buildInterests({ ...form, share }, owner.id, owner.interests || []),
  }
}

function EditOwnerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const addedOwners = useAddedOwners()
  const overrides = useOwnerOverrides()
  const register = mergeOwnerRegister(addedOwners, seedOwners, overrides)
  const owner = register.find((item) => item.id === id || item.code === id) || null
  const [form, setForm] = useState(() => (owner ? formFromOwner(owner) : null))
  const [errors, setErrors] = useState({})

  if (!owner || !form) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Owner not found</h1>
        <Link to="/organization/owners" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Owners
        </Link>
      </section>
    )
  }

  const allocated = allocatedShare(register)

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function onFile(file) {
    if (!file) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (file.type && !allowed.includes(file.type)) {
      setErrors((current) => ({ ...current, fileName: 'Use a PDF, JPG, or PNG file.' }))
      return
    }
    update('fileName', file.name)
  }

  function validate() {
    const nextErrors = {}
    const others = allocatedShare(register, owner.id)
    if (!form.name.trim()) nextErrors.name = 'Enter an owner name.'
    if (!form.code.trim()) nextErrors.code = 'Enter an owner code.'
    if (!form.type) nextErrors.type = 'Select an owner type.'
    if (!form.share.trim()) nextErrors.share = 'Enter an ownership share.'
    else if (parseShare(form.share) <= 0) nextErrors.share = 'Enter an ownership share.'
    else if (others + parseShare(form.share) > 100) nextErrors.share = 'Effective ownership must total 100%.'
    if (form.email.trim() && !form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
    if (form.code.trim() && ownerCodeTaken(form.code, owner.code)) nextErrors.code = 'This owner code is already in use.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function save(event) {
    event.preventDefault()
    if (!validate()) return
    const updated = updateOwnerRecord(toUpdatedOwner(owner, form))
    toast.success(`${updated.name} updated.`)
    navigate(`/organization/owners/${updated.id}`)
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
            <SelectField label="Owner type" required value={form.type} error={errors.type} placeholder="Select owner type" options={withCurrent(ownerTypes, form.type)} onChange={(value) => update('type', value)} />
            <Field label="Identity / registration no." value={form.identity} placeholder="Enter identity / registration no." onChange={(value) => update('identity', value)} />
          </FormCard>

          <FormCard title="Contact and address">
            <Field label="Email" type="email" value={form.email} error={errors.email} placeholder="Enter email" onChange={(value) => update('email', value)} />
            <Field label="Phone" value={form.phone} placeholder="Enter contact phone" onChange={(value) => update('phone', value)} />
            <Field label="Address" value={form.address} placeholder="Enter address" onChange={(value) => update('address', value)} />
            <Field label="Country of registration" value={form.country} placeholder="Enter country of registration" onChange={(value) => update('country', value)} />
          </FormCard>

          <FormCard title="Ownership and authority">
            <Field label="Ownership share" required value={form.share} error={errors.share} placeholder="Enter ownership share" onChange={(value) => update('share', value)} />
            <Field label="Capital commitment" value={form.capitalCommitment} placeholder="Enter capital commitment" onChange={(value) => update('capitalCommitment', value)} />
            <Field label="Effective date" value={form.effectiveDate} placeholder="Select date" onChange={(value) => update('effectiveDate', value)} />
            <Field label="Capital account" value={form.capitalAccount} placeholder="Enter capital account" onChange={(value) => update('capitalAccount', value)} />
            <Field label="Authorized signatory" value={form.signatory} placeholder="Enter authorized signatory" onChange={(value) => update('signatory', value)} />
            <SelectField label="Status" value={form.status} placeholder="Select status" options={ownerStatuses} onChange={(value) => update('status', value)} />
            <div className="rounded-xl bg-[#eef4ff] px-4 py-3.5 md:col-span-2">
              <p className="text-[13px] font-semibold text-[#2f6fed]">Ownership validation</p>
              <p className="mt-1 text-[13px] leading-5 text-slate-600">{allocationMessage(allocated)}</p>
            </div>
          </FormCard>

          <FormCard title="Documents and notes">
            <Field label="Document type" value={form.documentType} placeholder="Identity / registration" onChange={(value) => update('documentType', value)} />
            <Field label="Document reference" value={form.documentReference} placeholder="Enter document reference" onChange={(value) => update('documentReference', value)} />
            <div className="md:col-span-2">
              <span className="text-sm text-slate-700">Upload document</span>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(event) => onFile(event.target.files?.[0])}
              />
              <p className="mt-1 text-[13px] text-slate-400">
                {form.fileName ? (
                  <>
                    <span className="text-slate-700">{form.fileName}</span>
                    {` · ${fileKind(form.fileName)} · `}
                  </>
                ) : (
                  'PDF, JPG or PNG · '
                )}
                <button type="button" onClick={() => fileRef.current?.click()} className="font-medium text-[#2f6fed]">
                  Choose a file
                </button>{' '}
                to attach supporting evidence.
              </p>
              {errors.fileName && <p className="mt-1 text-xs text-rose-500">{errors.fileName}</p>}
            </div>
            <label className="block md:col-span-2">
              <span className="text-sm text-slate-700">Internal notes</span>
              <textarea
                value={form.notes}
                rows={3}
                placeholder="Add remarks for authorized workspace administrators"
                onChange={(event) => update('notes', event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400"
              />
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
            <button type="submit" className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white">
              Save changes
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
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClass[form.status] || 'bg-slate-100 text-slate-500'}`}>
              {form.status || 'Active'}
            </span>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{owner.summary}</p>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Created by" value={owner.createdBy || '—'} />
            <SideFact label="Created on" value={owner.createdOn || '—'} />
            <SideFact label="Updated" value={owner.updatedOn || '—'} />
            <SideFact label="Record status" value={form.status || owner.status} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{owner.access}</p>
          </div>
          <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3.5">
            <p className="text-[13px] font-semibold text-slate-700">History is retained</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">
              Existing documents remain until replacements are saved.
            </p>
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
            <option key={option} value={option}>
              {option}
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

export default EditOwnerPage
