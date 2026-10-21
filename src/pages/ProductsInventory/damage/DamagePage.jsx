import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  damageAudit,
  damageDocument,
  damageLine,
  damageSteps,
  damageTypes,
  lineValue,
} from './damageRecords.js'

function DamagePage() {
  const [status, setStatus] = useState('draft')
  const [branch, setBranch] = useState(damageDocument.branch)
  const [warehouse, setWarehouse] = useState(damageDocument.warehouse)
  const [reportedOn, setReportedOn] = useState(damageDocument.reportedOn)
  const [reportedBy, setReportedBy] = useState(damageDocument.reportedBy)
  const [approver, setApprover] = useState(damageDocument.approver)
  const [damageType, setDamageType] = useState(damageDocument.damageType)
  const [reason, setReason] = useState(damageDocument.reason)
  const [evidence, setEvidence] = useState(damageDocument.evidence)
  const loss = lineValue(damageLine)
  const stockAfter = damageLine.stockBefore - damageLine.qty

  function saveDraft() {
    setStatus('draft')
    toast.success('Draft saved. Stock and the ledger are unchanged.')
  }

  function submit() {
    setStatus('pending')
    toast.info('Damage report submitted for approval. Stock is unchanged until it is approved.')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#2f6fed] uppercase">
            Products & Inventory / Product Damage
          </p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Product Damage</h1>
          <p className="mt-2 text-sm text-slate-500">
            {damageDocument.number} · {statusPhrase(status)} · PKR values shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={saveDraft}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={status !== 'draft'}
            className="cursor-pointer rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'pending' ? 'Submitted' : 'Submit for Approval'}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {damageSteps.map((step) => {
          const selected = step.key === status
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => setStatus(step.key)}
              className={`cursor-pointer rounded-lg border bg-white px-4 py-2.5 text-left text-sm ${
                selected ? 'border-[#2f6fed] font-medium text-[#2f6fed]' : 'border-slate-200 text-slate-500'
              }`}
            >
              {step.label}
            </button>
          )
        })}
      </div>

      <section className="grid items-start gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Report details</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {branch || 'No branch'} · {warehouse || 'No warehouse'}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Branch" value={branch} onChange={setBranch} />
            <Field label="Warehouse" value={warehouse} onChange={setWarehouse} />
            <Field label="Reported on" value={reportedOn} onChange={setReportedOn} />
            <Field label="Reported by" value={reportedBy} onChange={setReportedBy} />
            <Field label="Requested approver" value={approver} onChange={setApprover} />
            <Field label="Damage type" value={damageType} onChange={setDamageType} />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Report status</h2>
          <p className="mt-0.5 text-xs text-slate-400">Optional accounting impact omitted</p>
          <span className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusPill[status]}`}>
            {statusLabel(status)}
          </span>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Trace label="Approved by" value={status === 'approved' ? readerName() : status === 'pending' ? `Awaiting ${approver || 'approver'}` : 'Not yet assigned'} />
            <Trace label="Approved at" value={status === 'approved' ? 'Just now' : '—'} />
            <Trace label="Stock movement" value={status === 'approved' ? damageDocument.number : '—'} />
            <Trace label="Voucher" value={status === 'approved' ? 'Created' : 'Not created'} />
          </dl>
        </article>
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <article className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Affected stock</h2>
              <p className="mt-0.5 text-xs text-slate-400">Identity, product, batch, and quantity</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-y border-slate-100 text-[11px] tracking-[0.12em] text-slate-400 uppercase">
                    <th className="px-5 py-2 font-semibold">Product</th>
                    <th className="px-3 py-2 font-semibold">Batch</th>
                    <th className="px-3 py-2 font-semibold">Expiry</th>
                    <th className="px-3 py-2 text-right font-semibold">Qty</th>
                    <th className="px-3 py-2 font-semibold">Unit</th>
                    <th className="px-3 py-2 text-right font-semibold">Unit cost (PKR)</th>
                    <th className="px-5 py-2 text-right font-semibold">Value (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-5 py-3 text-sm text-slate-800">
                      <span className="font-mono text-[12px] text-slate-400">{damageLine.sku}</span>
                      <span> · {damageLine.product}</span>
                    </td>
                    <td className="px-3 py-3 font-mono text-[12px] text-slate-600">{damageLine.batch}</td>
                    <td className="px-3 py-3 text-sm text-slate-600">{damageLine.expiry}</td>
                    <td className="px-3 py-3 text-right text-sm text-slate-800">{damageLine.qty}</td>
                    <td className="px-3 py-3 text-sm text-slate-500">{damageLine.unit}</td>
                    <td className="px-3 py-3 text-right text-sm text-slate-700">{formatPlain(damageLine.unitCost)}</td>
                    <td className="px-5 py-3 text-right text-sm text-slate-800">{formatPlain(loss)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="space-y-4 px-5 py-4">
              <Field label="Reason / investigation" value={reason} onChange={setReason} />
              <Field label="Supporting evidence" value={evidence} onChange={setEvidence} />
              <div className="flex flex-wrap gap-2">
                {damageTypes.map((type) => {
                  const selected = type === damageType
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDamageType(type)}
                      className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm ${
                        selected ? 'border-[#2f6fed] bg-[#eaf3ff] font-medium text-[#2f6fed]' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>
          </article>

          <div className="rounded-xl bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-700">{bannerTitle(status)}</p>
            <p className="mt-1 text-sm leading-5 text-amber-800/80">{bannerBody(status, stockAfter)}</p>
          </div>

          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Audit history</h2>
            <p className="mt-0.5 text-xs text-slate-400">Actor · Date · Document</p>
            <ul className="mt-3 divide-y divide-slate-100">
              {status === 'approved' && (
                <AuditRow time="Just now" actor={readerName()} detail={`Approved the damage report and created a stock-out of ${damageLine.qty} pcs`} />
              )}
              {status === 'pending' && (
                <AuditRow time="Just now" actor={readerName()} detail="Submitted the damage report for approval - no stock movement created" />
              )}
              {status === 'rejected' && (
                <AuditRow time="Just now" actor={readerName()} detail="Rejected the damage report - no stock movement created" />
              )}
              {status === 'cancelled' && (
                <AuditRow time="Just now" actor={readerName()} detail="Cancelled the draft report - no stock movement created" />
              )}
              {damageAudit.map((event) => (
                <AuditRow key={event.time} time={event.time} actor={event.actor} detail={event.detail} />
              ))}
            </ul>
          </section>
        </div>

        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Approval impact preview</h2>
          <p className="mt-0.5 text-xs text-slate-400">Optional accounting impact omitted</p>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Trace label="Stock before approval" value={`${damageLine.stockBefore} ${damageLine.unit}`} />
            <Trace label="Damage quantity" value={`${damageLine.qty} ${damageLine.unit}`} />
            <Trace label="Stock after approval" value={`${stockAfter} ${damageLine.unit}`} />
            <Trace label="Unit cost" value={`PKR ${formatPlain(damageLine.unitCost)}`} />
            <Trace
              label="Inventory loss"
              value={`PKR ${formatPlain(loss)}`}
              labelClassName="font-medium text-slate-800"
              valueClassName="text-[15px] font-semibold text-slate-900"
            />
          </dl>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 text-[11px] tracking-[0.12em] text-slate-400 uppercase">
                <th className="py-2 font-semibold">Account</th>
                <th className="py-2 text-right font-semibold">Dr</th>
                <th className="py-2 text-right font-semibold">Cr</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 text-slate-700">Inventory Loss</td>
                <td className="py-2.5 text-right text-slate-800">{formatPlain(loss)}</td>
                <td className="py-2.5 text-right text-slate-400">—</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-700">Inventory</td>
                <td className="py-2.5 text-right text-slate-400">—</td>
                <td className="py-2.5 text-right text-slate-800">{formatPlain(loss)}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 rounded-xl bg-[#eaf3ff] px-4 py-3">
            <p className="text-sm font-semibold text-[#2f6fed]">Balanced entry on approval</p>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Inventory Loss DR PKR {formatPlain(loss)} · Inventory CR PKR {formatPlain(loss)} will post through centralized accounting with a linked voucher. No entry exists while {statusLabel(status)}.
            </p>
          </div>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Trace label="Required role" value="Warehouse Manager" />
            <Trace label="Approval permission" value={`Approve · ${warehouse || 'Warehouse'}`} />
            <Trace label="Reporter self-approval" value="Not allowed" />
          </dl>
        </article>
      </section>
    </div>
  )
}

const statusPill = {
  draft: 'bg-slate-100 text-slate-500',
  pending: 'bg-amber-50 text-amber-600',
  approved: 'bg-emerald-50 text-emerald-600',
  rejected: 'bg-rose-50 text-rose-600',
  cancelled: 'bg-slate-100 text-slate-500',
}

function statusLabel(status) {
  if (status === 'pending') return 'Pending'
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'cancelled') return 'Cancelled'
  return 'Draft'
}

function statusPhrase(status) {
  if (status === 'pending') return 'Pending damage report · No stock or ledger impact yet'
  if (status === 'approved') return 'Approved damage report · Stock and ledger updated'
  if (status === 'rejected') return 'Rejected damage report · No stock or ledger impact'
  if (status === 'cancelled') return 'Cancelled damage report · No stock or ledger impact'
  return 'Draft damage report · No stock or ledger impact yet'
}

function bannerTitle(status) {
  if (status === 'approved') return 'Damage stock-out created'
  if (status === 'pending') return 'Pending report does not reduce stock'
  if (status === 'rejected') return 'Rejected report does not reduce stock'
  if (status === 'cancelled') return 'Cancelled report does not reduce stock'
  return 'Draft report does not reduce stock'
}

function bannerBody(status, stockAfter) {
  if (status === 'approved') {
    return `A damage stock-out of ${damageLine.qty} pcs has been created. System quantity is now ${stockAfter} pcs.`
  }
  return `Current system quantity is ${damageLine.stockBefore} pcs. Approval will create a damage stock-out of ${damageLine.qty} pcs, leaving ${stockAfter} pcs. A rejected or cancelled draft creates no movement.`
}

function formatPlain(value) {
  return Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function readerName() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user?.name || 'Super Admin'
  } catch {
    return 'Super Admin'
  }
}

function AuditRow({ time, actor, detail }) {
  return (
    <li className="grid gap-1 py-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4">
      <p className="text-sm text-slate-400">{time}</p>
      <div>
        <p className="text-sm font-semibold text-slate-800">{actor}</p>
        <p className="text-sm text-slate-500">{detail}</p>
      </div>
    </li>
  )
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400"
      />
    </label>
  )
}

function Trace({ label, value, labelClassName = 'text-slate-500', valueClassName = 'font-medium text-slate-800' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={labelClassName}>{label}</dt>
      <dd className={`text-right ${valueClassName}`}>{value}</dd>
    </div>
  )
}

export default DamagePage
