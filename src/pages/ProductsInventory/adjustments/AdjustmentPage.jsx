import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  adjustmentDocument,
  adjustmentLines,
  adjustmentSteps,
  auditHistory,
  lineValue,
  lineVariance,
} from './adjustmentRecords.js'

function AdjustmentPage() {
  const [status, setStatus] = useState('pending')
  const [branch, setBranch] = useState(adjustmentDocument.branch)
  const [warehouse, setWarehouse] = useState(adjustmentDocument.warehouse)
  const [reason, setReason] = useState(adjustmentDocument.reason)
  const [reference, setReference] = useState(adjustmentDocument.reference)
  const [createdBy, setCreatedBy] = useState(adjustmentDocument.createdBy)
  const [approver, setApprover] = useState(adjustmentDocument.approver)
  const [submitted, setSubmitted] = useState(adjustmentDocument.submitted)
  const [approval, setApproval] = useState(adjustmentDocument.approval)
  const [countNote, setCountNote] = useState(adjustmentDocument.countNote)
  const decided = status === 'approved' || status === 'rejected'
  const varianceLines = adjustmentLines.filter((line) => lineVariance(line) !== 0)

  function chooseStatus(next) {
    setStatus(next)
    if (next === 'approved') setApproval('Approved')
    else if (next === 'rejected') setApproval('Rejected')
    else setApproval('Not yet approved')
  }

  function approve() {
    chooseStatus('approved')
    toast.success('Adjustment approved. The variance can post to the ledger.')
  }

  function reject() {
    chooseStatus('rejected')
    toast.info('Adjustment rejected. No stock movement will be posted.')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#2f6fed] uppercase">
            Products & Inventory / Adjustments
          </p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Stock Adjustment</h1>
          <p className="mt-2 text-sm text-slate-500">
            {adjustmentDocument.number} · {reason || 'No reason'} · {statusLabel(status)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reject}
            disabled={decided}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={approve}
            disabled={decided}
            className="cursor-pointer rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'approved' ? 'Approved' : 'Approve Adjustment'}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {adjustmentSteps.map((step) => {
          const selected = step.key === status
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => chooseStatus(step.key)}
              className={`cursor-pointer rounded-lg border bg-white px-4 py-2.5 text-left text-sm ${
                selected ? 'border-[#2f6fed] font-medium text-[#2f6fed]' : 'border-slate-200 text-slate-500'
              }`}
            >
              {step.label}
            </button>
          )
        })}
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Adjustment context</h2>
        <p className="mt-0.5 text-xs text-slate-400">Counted {adjustmentDocument.countedOn}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Branch" value={branch} onChange={setBranch} />
          <Field label="Warehouse" value={warehouse} onChange={setWarehouse} />
          <Field label="Reason" value={reason} onChange={setReason} />
          <Field label="Count reference" value={reference} onChange={setReference} />
          <Field label="Created by" value={createdBy} onChange={setCreatedBy} />
          <Field label="Requested approver" value={approver} onChange={setApprover} />
          <Field label="Submitted" value={submitted} onChange={setSubmitted} />
          <Field label="Approval" value={approval} onChange={setApproval} />
        </div>
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">System versus actual quantities</h2>
            <p className="mt-0.5 text-xs text-slate-400">Difference = actual count − system quantity</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-y border-slate-100 text-[11px] tracking-[0.12em] text-slate-400 uppercase">
                  <th className="px-5 py-2 font-semibold">Product</th>
                  <th className="px-3 py-2 font-semibold">Unit</th>
                  <th className="px-3 py-2 text-right font-semibold">System</th>
                  <th className="px-3 py-2 text-right font-semibold">Actual</th>
                  <th className="px-3 py-2 text-right font-semibold">Difference</th>
                  <th className="px-3 py-2 text-right font-semibold">Unit cost (PKR)</th>
                  <th className="px-5 py-2 text-right font-semibold">Value impact (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {adjustmentLines.map((line) => {
                  const variance = lineVariance(line)
                  const impact = lineValue(line)
                  return (
                    <tr key={line.sku} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-5 py-3 text-sm text-slate-800">
                        <span className="font-mono text-[12px] text-slate-400">{line.sku}</span>
                        <span> · {line.product}</span>
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-500">{line.unit}</td>
                      <td className="px-3 py-3 text-right text-sm text-slate-700">{line.system}</td>
                      <td className="px-3 py-3 text-right text-sm text-slate-700">{line.counted}</td>
                      <td className={`px-3 py-3 text-right text-sm font-medium ${varianceClass(variance)}`}>
                        {formatQty(variance)}
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-slate-700">{formatPlain(line.unitCost)}</td>
                      <td className={`px-5 py-3 text-right text-sm font-medium ${varianceClass(impact)}`}>
                        {formatAmount(impact)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </article>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Count note</span>
        <input
          value={countNote}
          onChange={(event) => setCountNote(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-400"
        />
      </label>

      <div className="rounded-xl bg-amber-50 px-4 py-3">
        <p className="text-sm font-semibold text-amber-700">
          {status === 'approved' ? 'Stock movements created' : 'Stock has not changed'}
        </p>
        <p className="mt-1 text-sm leading-5 text-amber-800/80">
          {status === 'approved'
            ? 'This document is Approved. Linked adjustment movements have been created.'
            : `This document is ${statusLabel(status)}. System quantities remain 18 coffee bags and 86 carry bags. Movements will be created atomically only when this adjustment is approved.`}
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Audit history</h2>
        <p className="mt-0.5 text-xs text-slate-400">{adjustmentDocument.auditNumber}</p>
        <ul className="mt-3 divide-y divide-slate-100">
          {status === 'approved' && (
            <AuditRow time="Just now" actor={readerName()} detail="Approved the adjustment and created stock movements" />
          )}
          {status === 'rejected' && (
            <AuditRow time="Just now" actor={readerName()} detail="Rejected the adjustment - no stock movement created" />
          )}
          {auditHistory.map((event) => (
            <AuditRow key={event.time} time={event.time} actor={event.actor} detail={event.detail} />
          ))}
        </ul>
      </section>
        </div>

        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Approval & stock-impact summary</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {status === 'approved' ? 'Posted' : 'Preview only'} · {statusLabel(status)}
          </p>
          <span className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusPill[status] || statusPill.pending}`}>
            {statusLabel(status)}
          </span>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Trace label="Products counted" value={String(adjustmentLines.length)} />
            <Trace label="Products with variance" value={String(varianceLines.length)} />
            <Trace label="Stock-out on approval" value="2 coffee bags" />
            <Trace label="Stock-in on approval" value="4 carry bags" />
            <Trace label="Stock-out value" value="−PKR 24.80" valueClassName="text-rose-500" />
            <Trace label="Stock-in value" value="+PKR 0.72" valueClassName="text-emerald-600" />
            <Trace label="Net inventory" value="−PKR 24.08" labelClassName="font-medium text-slate-800" valueClassName="text-[15px] font-semibold text-rose-500" />
          </dl>
          <div className="mt-4 rounded-xl bg-[#eaf3ff] px-4 py-3">
            <p className="text-sm font-semibold text-[#2f6fed]">Approval creates movements</p>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Approval creates linked adjustment movements and stores approver, date, and document reference. Rejection leaves stock unchanged.
            </p>
          </div>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Trace label="Approver" value={status === 'approved' ? readerName() : 'Awaiting Nadia Saleh'} />
            <Trace label="Approved on" value={status === 'approved' ? 'Just now' : '—'} />
            <Trace label="Movement references" value={status === 'approved' ? adjustmentDocument.number : 'Not yet created'} />
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
}

function statusLabel(status) {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'draft') return 'Draft'
  return 'Pending'
}

function varianceClass(value) {
  if (value < 0) return 'text-rose-500'
  if (value > 0) return 'text-emerald-600'
  return 'text-slate-400'
}

function formatQty(value) {
  if (value > 0) return `+${value}`
  return String(value)
}

function formatPlain(value) {
  return Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatAmount(value) {
  const amount = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (value < 0) return `-${amount}`
  if (value > 0) return `+${amount}`
  return amount
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

export default AdjustmentPage
