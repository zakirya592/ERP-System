import { Plus, Trash2 } from 'lucide-react'
import {
  agreementTypes,
  allocationTotals,
  emptyPartner,
  formatMoney,
  formatShare,
  ownerIdOptions,
  ownerNameOptions,
  parseMoney,
  partnershipRule,
  partnershipStatuses,
  settlementFrequencies,
  withOption,
} from './partnershipRecords.js'
import { Field, FormCard, SelectField } from './partnershipUi.jsx'

export function PartnershipForm({ form, errors, update, setPartners, branchOptions, owners }) {
  const totals = allocationTotals(form.partners)
  const people = ownerNameOptions(owners, [
    form.managingPartner,
    form.reviewOwner,
    form.profitOwner,
    form.lossOwner,
    form.approvalAuthority,
  ])
  const partnerOptions = ownerIdOptions(owners, form.partners)

  function updatePartner(id, key, value) {
    setPartners((partners) =>
      partners.map((row) => {
        if (String(row.id) !== String(id)) return row
        if (key === 'ownerId') {
          const owner = partnerOptions.find((option) => option.value === value)
          return { ...row, ownerId: value, name: owner?.label || '' }
        }
        return { ...row, [key]: value }
      }),
    )
  }

  function removePartner(id) {
    setPartners((partners) => {
      if (partners.length <= 1) return partners
      return partners.filter((row) => String(row.id) !== String(id))
    })
  }

  return (
    <>
      <FormCard title="Agreement information">
        <Field label="Partnership name" required value={form.name} error={errors.name} placeholder="Enter partnership name" onChange={(value) => update('name', value)} />
        <Field label="Agreement code" required value={form.code} error={errors.code} placeholder="Enter agreement code" onChange={(value) => update('code', value)} />
        <SelectField label="Agreement type" required value={form.agreementType} error={errors.agreementType} placeholder="Select agreement type" options={withOption(agreementTypes, form.agreementType)} onChange={(value) => update('agreementType', value)} />
        <SelectField label="Responsible branch" required value={form.branch} error={errors.branch} placeholder="Select branch" options={branchOptions} onChange={(value) => update('branch', value)} />
        <SelectField label="Status" required value={form.status} error={errors.status} options={withOption(partnershipStatuses, form.status)} onChange={(value) => update('status', value)} />
      </FormCard>

      <FormCard title="Term and financial settings">
        <Field label="Effective date" required type="date" value={form.effectiveDate} error={errors.effectiveDate} onChange={(value) => update('effectiveDate', value)} />
        <Field label="End / review date" type="date" value={form.endDate} error={errors.endDate} onChange={(value) => update('endDate', value)} />
        <Field
          label="Capital commitment"
          value={form.capitalCommitment}
          error={errors.capitalCommitment}
          placeholder="PKR 0"
          onChange={(value) => update('capitalCommitment', value)}
          onBlur={() => {
            if (form.capitalCommitment.trim()) update('capitalCommitment', formatMoney(parseMoney(form.capitalCommitment)))
          }}
        />
        <SelectField label="Settlement frequency" value={form.distributionFrequency} error={errors.distributionFrequency} placeholder="Select settlement frequency" options={withOption(settlementFrequencies, form.distributionFrequency)} onChange={(value) => update('distributionFrequency', value)} />
      </FormCard>

      <FormCard title="Participants and governance">
        <SelectField label="Managing partner" required value={form.managingPartner} error={errors.managingPartner} placeholder="Select managing partner" options={people} onChange={(value) => update('managingPartner', value)} />
        <SelectField label="Review owner" required value={form.reviewOwner} error={errors.reviewOwner} placeholder="Select review owner" options={people} onChange={(value) => update('reviewOwner', value)} />
        <SelectField label="Profit allocation owner" required value={form.profitOwner} error={errors.profitOwner} placeholder="Select profit allocation owner" options={people} onChange={(value) => update('profitOwner', value)} />
        <SelectField label="Loss allocation owner" required value={form.lossOwner} error={errors.lossOwner} placeholder="Select loss allocation owner" options={people} onChange={(value) => update('lossOwner', value)} />
        <SelectField label="Approval authority" required value={form.approvalAuthority} error={errors.approvalAuthority} placeholder="Select approval authority" options={people} onChange={(value) => update('approvalAuthority', value)} />
      </FormCard>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Partner contribution and allocation</h2>
          <button
            type="button"
            onClick={() => setPartners((partners) => [...partners, emptyPartner()])}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#2f6fed]"
          >
            <Plus size={15} />
            Add partner
          </button>
        </div>
        {errors.partners && <p className="mt-2 text-xs text-rose-500">{errors.partners}</p>}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-[12px] font-semibold text-slate-400">
                <th className="px-2 py-2 font-semibold">Partner</th>
                <th className="px-2 py-2 font-semibold">Contribution</th>
                <th className="px-2 py-2 font-semibold">Ownership</th>
                <th className="px-2 py-2 font-semibold">Profit share</th>
                <th className="px-2 py-2 font-semibold">Loss share</th>
              </tr>
            </thead>
            <tbody>
              {(form.partners || []).map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label="Partner"
                        value={row.ownerId}
                        onChange={(event) => updatePartner(row.id, 'ownerId', event.target.value)}
                        className={`min-w-0 flex-1 rounded-lg border bg-white px-2 py-2 text-sm outline-none focus:border-sky-400 ${row.ownerId ? 'text-slate-800' : 'text-slate-400'} border-slate-200`}
                      >
                        <option value="">Select partner</option>
                        {partnerOptions.map((person) => (
                          <option key={person.value} value={person.value}>
                            {person.label}
                          </option>
                        ))}
                      </select>
                      {(form.partners || []).length > 1 ? (
                        <button
                          type="button"
                          aria-label={`Remove ${row.name || 'partner'}`}
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            removePartner(row.id)
                          }}
                          className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                  {['contribution', 'ownership', 'profitShare', 'lossShare'].map((key) => (
                    <td key={key} className="px-2 py-2">
                      <input
                        aria-label={key}
                        value={row[key]}
                        placeholder={key === 'contribution' ? 'PKR 0' : '0%'}
                        onChange={(event) => updatePartner(row.id, key, event.target.value)}
                        onBlur={() => {
                          if (key === 'contribution' && row.contribution) {
                            updatePartner(row.id, key, formatMoney(parseMoney(row.contribution)))
                          }
                          if (key !== 'contribution' && row[key]) updatePartner(row.id, key, formatShare(row[key]))
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-800 outline-none focus:border-sky-400"
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-slate-200 font-medium text-slate-800">
                <td className="px-2 py-3">Total</td>
                <td className="px-2 py-3">{totals.contribution}</td>
                <td className="px-2 py-3">{totals.ownership}</td>
                <td className="px-2 py-3">{totals.profitShare}</td>
                <td className="px-2 py-3">{totals.lossShare}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <FormCard title="Notes">
        <label className="block md:col-span-2">
          <span className="text-sm text-slate-700">Notes</span>
          <textarea
            value={form.notes}
            rows={3}
            placeholder="Enter notes for approvers, exceptions or amendments"
            onChange={(event) => update('notes', event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400"
          />
          {errors.notes && <p className="mt-1 text-xs text-rose-500">{errors.notes}</p>}
        </label>
      </FormCard>
      <p className="text-xs text-slate-400">{partnershipRule}</p>
    </>
  )
}
