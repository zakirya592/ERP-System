import { useState } from 'react'
import { Printer, Send } from 'lucide-react'
import { toast } from 'react-toastify'

const steps = [
  { key: 'draft', label: 'Draft' },
  { key: 'approved', label: 'Approved' },
  { key: 'posted', label: 'Posted' },
  { key: 'cancelled', label: 'Cancelled' },
]

const lines = [
  { sku: 'BEV-1042', name: 'Arabica Coffee 1 kg', sold: 24, qty: 2, unit: 'bag', price: 18.9, tax: 0.05, net: 37.8 },
  { sku: 'SNK-1510', name: 'Sea Salt Crackers', sold: 8, qty: 2, unit: 'box', price: 13.5, tax: 0.05, net: 27 },
]

const accounts = [
  { account: 'Sales Returns', dr: 64.8, cr: null },
  { account: 'Output Tax', dr: 3.24, cr: null },
  { account: 'Customer AR', dr: null, cr: 68.04 },
  { account: 'Inventory', dr: 41.2, cr: null },
  { account: 'Cost of Sales', dr: null, cr: 41.2 },
]

const initialAudit = [
  { at: 'Oct 01 11:10', name: 'Amna Rehman', text: 'Approved return · Ready to post' },
  { at: 'Oct 01 10:55', name: 'Sara Noor', text: 'Confirmed resalable condition and quantities' },
  { at: 'Oct 01 10:40', name: 'Omar Khalid', text: 'Created draft from SL-09180' },
]

const stageCopy = {
  draft: 'Draft return',
  approved: 'Approved return',
  posted: 'Posted return',
  cancelled: 'Cancelled return',
}

function money(value) {
  if (value == null) return '—'
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function nowStamp() {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const initialContext = {
  originalSale: 'SL-09180 · Posted Sep 26',
  customer: 'Coastal Café Group',
  branch: 'Central Branch',
  warehouse: 'Main Warehouse',
  returnDate: 'Oct 01, 2026',
  currency: 'PKR',
  reason: 'Customer over-order',
  condition: 'Unopened · Resalable',
  note: 'Four unopened units accepted for return. Customer requests credit against the original invoice in PKR; no cash refund.',
}

function SalesReturnPage() {
  const [stage, setStage] = useState('approved')
  const [audit, setAudit] = useState(initialAudit)
  const [context, setContext] = useState(initialContext)
  const locked = stage === 'posted' || stage === 'cancelled'
  const debitTotal = accounts.reduce((sum, row) => sum + (row.dr || 0), 0)
  const creditTotal = accounts.reduce((sum, row) => sum + (row.cr || 0), 0)

  function updateContext(key, value) {
    setContext((current) => ({ ...current, [key]: value }))
  }

  function record(text) {
    setAudit((current) => [{ at: nowStamp(), name: 'Super Admin', text }, ...current])
  }

  function printReturn() {
    toast.success('Sales return sent to print.')
  }

  function cancelReturn() {
    if (stage === 'posted') {
      toast.error('A posted return cannot be cancelled.')
      return
    }
    if (stage === 'cancelled') {
      toast.error('This return is already cancelled.')
      return
    }
    setStage('cancelled')
    record('Cancelled return · No stock or ledger movement')
    toast.success('Sales return cancelled.')
  }

  function postReturn() {
    if (stage === 'posted') {
      toast.error('This return is already posted.')
      return
    }
    if (stage !== 'approved') {
      toast.error('Only an approved return can be posted.')
      return
    }
    setStage('posted')
    record('Posted return · Stock-IN and customer credit recorded')
    toast.success('Sales return posted.')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Sales / Sales Returns</p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Sales Return</h1>
          <p className="mt-2 text-sm text-slate-500">
            SR-00074 · {stageCopy[stage]} · Original sale SL-09180 · PKR
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={printReturn}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            <Printer size={15} />
            Print Return
          </button>
          <button
            type="button"
            onClick={cancelReturn}
            disabled={locked}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            Cancel Return
          </button>
          <button
            type="button"
            onClick={postReturn}
            disabled={locked}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Send size={15} />
            Post Return
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const active = stage === step.key
          return (
            <div
              key={step.key}
              className={
                active
                  ? 'rounded-lg border border-[#93c5fd] bg-white px-4 py-2.5 text-sm font-medium text-[#2f6fed]'
                  : 'rounded-lg border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-400'
              }
            >
              {index + 1} {step.label}
            </div>
          )
        })}
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Customer & receiving context</h2>
        <p className="mt-0.5 text-xs text-slate-400">Source sale and return destination</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Original sale" value={context.originalSale} disabled={locked} onChange={(value) => updateContext('originalSale', value)} />
          <Field label="Customer" value={context.customer} disabled={locked} onChange={(value) => updateContext('customer', value)} />
          <Field label="Branch" value={context.branch} disabled={locked} onChange={(value) => updateContext('branch', value)} />
          <Field label="Receiving warehouse" value={context.warehouse} disabled={locked} onChange={(value) => updateContext('warehouse', value)} />
          <Field label="Return date" value={context.returnDate} disabled={locked} onChange={(value) => updateContext('returnDate', value)} />
          <Field label="Currency" value={context.currency} disabled={locked} onChange={(value) => updateContext('currency', value)} />
          <Field label="Reason" value={context.reason} disabled={locked} onChange={(value) => updateContext('reason', value)} />
          <Field label="Condition" value={context.condition} disabled={locked} onChange={(value) => updateContext('condition', value)} />
        </div>
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Return lines</h2>
            <p className="mt-0.5 text-xs text-slate-400">Return quantities validated against the original sale</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase">
                    <th className="pb-2 pr-3 font-medium">Product</th>
                    <th className="px-3 pb-2 text-right font-medium">Sold</th>
                    <th className="px-3 pb-2 text-right font-medium">Return</th>
                    <th className="px-3 pb-2 font-medium">Unit</th>
                    <th className="px-3 pb-2 text-right font-medium">Price</th>
                    <th className="px-3 pb-2 text-right font-medium">Tax</th>
                    <th className="pb-2 pl-3 text-right font-medium">Net (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.sku} className="border-t border-slate-100">
                      <td className="py-3 pr-3">
                        <p className="font-mono text-[11px] text-slate-400">{line.sku}</p>
                        <p className="text-sm font-medium text-slate-800">{line.name}</p>
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-slate-600">{line.sold}</td>
                      <td className="px-3 py-3 text-right text-sm font-medium text-slate-800">{line.qty}</td>
                      <td className="px-3 py-3 text-sm text-slate-600">{line.unit}</td>
                      <td className="px-3 py-3 text-right text-sm text-slate-600">{money(line.price)}</td>
                      <td className="px-3 py-3 text-right text-sm text-slate-600">{Math.round(line.tax * 100)}%</td>
                      <td className="py-3 pl-3 text-right text-sm font-medium text-slate-800">{money(line.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <label className="mt-4 block">
              <span className="text-xs text-slate-400">Return note</span>
              <textarea
                value={context.note}
                disabled={locked}
                rows={3}
                onChange={(event) => updateContext('note', event.target.value)}
                className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 disabled:bg-slate-50"
              />
            </label>
            <div className="mt-3 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2.5">
              <p className="text-[13px] font-medium text-sky-700">Posting creates stock-IN and reverses accounting</p>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                Original sale does not change stock. On posting, receive 2 coffee bags and 2 cracker boxes into Main Warehouse and credit the customer PKR 68.04.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Approval & audit</h2>
            <p className="mt-0.5 text-xs text-slate-400">SR-00074 · Creator Omar Khalid</p>
            <ol className="mt-4 space-y-4">
              {audit.map((entry) => (
                <li key={`${entry.at}-${entry.name}`} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3">
                  <p className="pt-0.5 text-xs text-slate-400">{entry.at}</p>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{entry.name}</p>
                    <p className="text-sm text-slate-500">{entry.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Return totals & reversal preview</h2>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                stage === 'cancelled' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {steps.find((step) => step.key === stage)?.label}
            </span>
          </div>
          <dl className="mt-4 space-y-2.5 text-sm">
            <TotalRow label="Subtotal" value={`PKR ${money(64.8)}`} />
            <TotalRow label="Discount" value="—" />
            <TotalRow label="Output Tax" value={`PKR ${money(3.24)}`} />
            <TotalRow label="Tax reversal (5%)" value={`PKR ${money(3.24)}`} />
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <dt className="font-medium text-slate-700">Credit total</dt>
              <dd className="text-lg font-semibold tracking-tight text-slate-900">PKR {money(68.04)}</dd>
            </div>
          </dl>

          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] tracking-[0.12em] text-slate-400 uppercase">
                <th className="pb-2 font-medium">Account</th>
                <th className="pb-2 text-right font-medium">Dr</th>
                <th className="pb-2 text-right font-medium">Cr</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((row) => (
                <tr key={row.account} className="border-t border-slate-100">
                  <td className="py-2 text-slate-700">{row.account}</td>
                  <td className="py-2 text-right text-slate-600">{money(row.dr)}</td>
                  <td className="py-2 text-right text-slate-600">{money(row.cr)}</td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 font-medium text-slate-800">
                <td className="py-2">Total</td>
                <td className="py-2 text-right">{money(debitTotal)}</td>
                <td className="py-2 text-right">{money(creditTotal)}</td>
              </tr>
            </tbody>
          </table>

          <Preview stage={stage} />
        </section>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, disabled }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 disabled:bg-slate-50"
      />
    </label>
  )
}

function TotalRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-slate-700">{value}</dd>
    </div>
  )
}

function Preview({ stage }) {
  if (stage === 'posted') {
    return (
      <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2.5">
        <p className="text-sm font-medium text-emerald-700">Posted · Balanced</p>
        <p className="mt-1 text-[13px] leading-5 text-emerald-700/80">
          Ledger reversal and stock-IN are recorded in PKR. This posted return is read-only.
        </p>
      </div>
    )
  }
  if (stage === 'cancelled') {
    return (
      <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2.5">
        <p className="text-sm font-medium text-rose-600">Cancelled</p>
        <p className="mt-1 text-[13px] leading-5 text-rose-500">
          This return will not post. No ledger reversal or stock movement was created.
        </p>
      </div>
    )
  }
  return (
    <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2.5">
      <p className="text-sm font-medium text-emerald-700">Preview only · Balanced</p>
      <p className="mt-1 text-[13px] leading-5 text-emerald-700/80">
        No ledger reversal or stock movement exists yet. Posting creates a linked voucher and movement references in PKR. Posted returns become read-only.
      </p>
    </div>
  )
}

export default SalesReturnPage
