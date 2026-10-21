import { useState } from 'react'
import { Printer } from 'lucide-react'
import { toast } from 'react-toastify'
import { shippedUnits, transferDocument, transferLines, workflow } from './transferRecords.js'

function TransferPage() {
  const [status, setStatus] = useState('in-transit')
  const [source, setSource] = useState(transferDocument.from)
  const [destination, setDestination] = useState(transferDocument.to)
  const [reason, setReason] = useState(transferDocument.reason)
  const received = status === 'received'
  const currentIndex = workflow.findIndex((step) => step.key === status)

  function receiveTransfer() {
    setStatus('received')
    toast.success('Transfer received. Destination stock is updated.')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Transfers / {transferDocument.number}
          </p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Warehouse Transfer</h1>
          <p className="mt-2 text-sm text-slate-500">
            Track stock movement from {transferDocument.warehouse} to {transferDocument.destination}.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${received ? 'bg-emerald-50 text-emerald-600' : 'bg-[#e8f1ff] text-[#2f6fed]'}`}>
              {received ? 'Received' : 'In Transit'}
            </span>
            <p className="text-xs text-slate-400">
              Created {transferDocument.created} · Expected {transferDocument.expected} · Vehicle {transferDocument.vehicle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            <Printer size={15} />
            Print
          </button>
          <button
            type="button"
            onClick={receiveTransfer}
            disabled={received}
            className="cursor-pointer rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {received ? 'Transfer received' : 'Receive Transfer'}
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Draft → In Transit → Received</h2>
        <p className="mt-0.5 text-xs text-slate-400">Current transfer workflow</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {workflow.map((step, index) => {
            const done = index < currentIndex
            const current = index === currentIndex
            const detail = step.key === 'received' && received ? 'Received just now' : step.detail
            return (
              <div
                key={step.key}
                className={`rounded-xl border px-4 py-3 ${
                  current
                    ? 'border-[#b9d0fb] bg-[#eef4ff]'
                    : done
                      ? 'border-slate-200 bg-slate-50'
                      : 'border-slate-200 bg-white'
                }`}
              >
                <p className={`text-sm font-medium ${current ? 'text-[#2f6fed]' : done ? 'text-slate-700' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{detail}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Transfer route</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Field label="Source" value={source} onChange={setSource} />
            <Field label="Destination" value={destination} onChange={setDestination} />
            <Field label="Reason" value={reason} onChange={setReason} />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Accountability</h2>
          <p className="mt-0.5 text-xs text-slate-400">Separation of duties</p>
          <dl className="mt-4 space-y-3 text-sm">
            <Trace label="Prepared" value={transferDocument.preparedBy} />
            <Trace label="Approved" value={transferDocument.approvedBy} />
            <Trace
              label="Receiver"
              value={received ? readerName() : `${transferDocument.receiver} · pending`}
              muted={!received}
            />
          </dl>
        </article>
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-2">
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Items</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {transferLines.length} lines · {shippedUnits} units
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-y border-slate-100 text-[11px] tracking-[0.12em] text-slate-400 uppercase">
                  <th className="px-5 py-2 font-semibold">SKU</th>
                  <th className="px-3 py-2 font-semibold">Product</th>
                  <th className="px-3 py-2 font-semibold">Unit</th>
                  <th className="px-3 py-2 text-right font-semibold">Shipped</th>
                  <th className="px-3 py-2 text-right font-semibold">Received</th>
                  <th className="px-5 py-2 font-semibold">Batch</th>
                </tr>
              </thead>
              <tbody>
                {transferLines.map((line) => (
                  <tr key={line.sku} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-5 py-3 font-mono text-[12px] text-slate-400">{line.sku}</td>
                    <td className="px-3 py-3 text-sm font-medium text-slate-800">{line.product}</td>
                    <td className="px-3 py-3 text-sm text-slate-500">{line.unit}</td>
                    <td className="px-3 py-3 text-right text-sm text-slate-700">{line.shipped}</td>
                    <td className="px-3 py-3 text-right text-sm text-slate-700">{line.shipped}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-400">
                      {line.batch ? <span className="font-mono text-[12px]">{line.batch}</span> : '— Not tracked'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Stock-impact summary</h2>
          <div className="mt-4 space-y-3">
            <Impact
              hint="Source reduction"
              value={`-${shippedUnits} units`}
              badge="Posted"
              valueClassName="text-rose-500"
              badgeClassName="bg-rose-50 text-rose-500"
              rowClassName="bg-rose-50/50"
            />
            <Impact
              hint={received ? 'Settled' : 'Stock in transit'}
              value={received ? '0 units' : `+${shippedUnits} units`}
              badge={received ? 'Settled' : 'Active'}
              valueClassName={received ? 'text-slate-400' : 'text-[#2f6fed]'}
              badgeClassName={received ? 'bg-slate-100 text-slate-500' : 'bg-[#e8f1ff] text-[#2f6fed]'}
              rowClassName={received ? 'bg-slate-50' : 'bg-[#eef4ff]'}
            />
            <Impact
              hint="Destination increase"
              value={`+${shippedUnits} units`}
              badge="On receipt"
              valueClassName={received ? 'text-emerald-600' : 'text-slate-500'}
              badgeClassName={received ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}
              rowClassName={received ? 'bg-emerald-50/60' : 'bg-slate-50'}
            />
          </div>
        </article>
      </section>
    </div>
  )
}

function readerName() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user?.name || 'Super Admin'
  } catch {
    return 'Super Admin'
  }
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

function Trace({ label, value, muted = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className={`text-right font-medium ${muted ? 'text-slate-400' : 'text-slate-800'}`}>{value}</dd>
    </div>
  )
}

function Impact({ hint, value, badge, valueClassName, badgeClassName, rowClassName }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3 ${rowClassName}`}>
      <div>
        <p className="text-xs text-slate-400">{hint}</p>
        <p className={`mt-0.5 text-[18px] leading-none font-semibold ${valueClassName}`}>{value}</p>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClassName}`}>{badge}</span>
    </div>
  )
}

export default TransferPage
