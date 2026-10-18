import { useMemo, useState } from 'react'
import { Check, Plus, Save, Search, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const documentNo = 'SL-09185'
const shipping = 45

const catalog = [
  { sku: 'BEV-1042', name: 'Arabica Coffee 1 kg', unit: 'bag', price: 18.9 },
  { sku: 'DAI-0448', name: 'Whole Milk 1 L', unit: 'crate', price: 25.2 },
  { sku: 'SNK-1510', name: 'Sea Salt Crackers', unit: 'box', price: 13.5 },
  { sku: 'BEV-1188', name: 'Sparkling Water', unit: 'case', price: 10.8 },
  { sku: 'CLN-2201', name: 'Floor Cleaner 5 L', unit: 'can', price: 8.2 },
  { sku: 'DRY-0081', name: 'Basmati Rice 25 kg', unit: 'bag', price: 31.5 },
]

const customers = ['Coastal Café Group', 'Northline Retail', 'Oasis Hospitality', 'Market Lane Foods', 'Walk-in customer']
const branches = ['Central Branch', 'North Branch', 'East Branch', 'Airport Shop']
const warehouses = ['Main Warehouse', 'North Warehouse', 'East Depot', 'Shop Store']
const terms = ['Net 14', 'Net 7', 'Net 30', 'Cash']
const paymentStates = ['Unpaid', 'Partially paid (PKR)', 'Paid']
const shipmentOptions = ['Standard · Oct 02', 'Express · Oct 01', 'Pickup · Oct 03']
const steps = [
  { key: 'draft', label: 'Draft' },
  { key: 'approved', label: 'Approved' },
  { key: 'posted', label: 'Posted' },
]

const initialLines = [
  line('BEV-1042', 24, 5),
  line('DAI-0448', 3, 0),
  line('SNK-1510', 8, 0),
  line('BEV-1188', 36, 2),
]

const previewTotals = {
  'BEV-1042': 452.47,
  'DAI-0448': 79.38,
  'SNK-1510': 113.4,
  'BEV-1188': 400.08,
}

const previewSummary = {
  subtotal: 1030.8,
  discount: 30.24,
  tax: 44.77,
  grand: 1089.33,
}

function line(sku, qty, discount) {
  const product = catalog.find((item) => item.sku === sku)
  return {
    sku,
    name: product.name,
    unit: product.unit,
    price: product.price,
    qty,
    discount,
    tax: 5,
  }
}

function money(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function NewSalePage() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('draft')
  const [customer, setCustomer] = useState('Coastal Café Group')
  const [branch, setBranch] = useState('Central Branch')
  const [warehouse, setWarehouse] = useState('Main Warehouse')
  const [saleDate, setSaleDate] = useState('Oct 01, 2026')
  const [term, setTerm] = useState('Net 14')
  const [lineWarehouse, setLineWarehouse] = useState('Main Warehouse')
  const [query, setQuery] = useState('')
  const [lines, setLines] = useState(initialLines)
  const [reference, setReference] = useState('CCG-PO-4882')
  const [note, setNote] = useState('Deliver before 10:00 AM')
  const [paymentState, setPaymentState] = useState('Partially paid (PKR)')
  const [received, setReceived] = useState('500')
  const [createShipment, setCreateShipment] = useState(true)
  const [shipment, setShipment] = useState('Standard · Oct 02')

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    return catalog.filter(
      (product) =>
        product.name.toLowerCase().includes(needle) || product.sku.toLowerCase().includes(needle),
    )
  }, [query])

  const usingPreview = lines.length === initialLines.length && lines.every((item, index) => {
    const seed = initialLines[index]
    return item.sku === seed.sku && item.qty === seed.qty && item.discount === seed.discount
  })

  const totals = useMemo(() => {
    return lines.reduce(
      (sum, item) => {
        const gross = item.qty * item.price
        const discount = gross * (item.discount / 100)
        const net = gross - discount
        const tax = net * (item.tax / 100)
        return {
          units: sum.units + item.qty,
          subtotal: sum.subtotal + gross,
          discount: sum.discount + discount,
          tax: sum.tax + tax,
        }
      },
      { units: 0, subtotal: 0, discount: 0, tax: 0 },
    )
  }, [lines])

  const summary = usingPreview
    ? previewSummary
    : {
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        grand: totals.subtotal - totals.discount + totals.tax + shipping,
      }
  const grand = summary.grand
  const receivedAmount = paymentState === 'Paid' ? grand : paymentState === 'Unpaid' ? 0 : Number(received) || 0
  const outstanding = Math.max(0, grand - receivedAmount)

  function updateLine(sku, key, value) {
    setLines((current) =>
      current.map((item) => (item.sku === sku ? { ...item, [key]: value } : item)),
    )
  }

  function addProduct(product) {
    setLines((current) => {
      const existing = current.find((item) => item.sku === product.sku)
      if (existing) {
        return current.map((item) => (item.sku === product.sku ? { ...item, qty: item.qty + 1 } : item))
      }
      return [...current, line(product.sku, 1, 0)]
    })
    setQuery('')
    toast.success(`${product.name} added.`)
  }

  function addLine() {
    if (matches.length === 1) {
      addProduct(matches[0])
      return
    }
    toast.info('Search for a product, SKU, or barcode.')
  }

  function saveDraft() {
    setStage('draft')
    toast.success(`Draft ${documentNo} saved.`)
  }

  function approve() {
    if (lines.length === 0) {
      toast.error('Add a product line before approving.')
      return
    }
    setStage('approved')
    toast.success(`${documentNo} approved. Inventory is reserved.`)
  }

  function postSale() {
    if (lines.length === 0) {
      toast.error('Add a product line before posting.')
      return
    }
    setStage('posted')
    toast.success(`${documentNo} posted.`)
    navigate('/sales/sales')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Sales / New</p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">New Sale</h1>
          <p className="mt-2 text-sm text-slate-500">
            Draft {documentNo} · Inventory is reserved when the sale is approved. All amounts are in PKR.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={saveDraft}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            <Save size={15} />
            Save Draft
          </button>
          <button
            type="button"
            onClick={approve}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            <Check size={15} />
            Approve
          </button>
          <button
            type="button"
            onClick={postSale}
            className="inline-flex items-center gap-2 rounded-full bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            <Send size={15} />
            Post Sale
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-6">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={
              stage === step.key
                ? 'rounded-lg border border-[#93c5fd] bg-white px-4 py-2.5 text-sm font-medium text-[#2f6fed]'
                : 'px-1 text-sm text-slate-400'
            }
          >
            {index + 1} {step.label}
          </div>
        ))}
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Customer & fulfilment</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Select label="Customer" value={customer} options={customers} onChange={setCustomer} />
              <Select label="Branch" value={branch} options={branches} onChange={setBranch} />
              <Select label="Warehouse" value={warehouse} options={warehouses} onChange={setWarehouse} />
            </div>
          </section>

          <section className="flex-1 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Line items</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {lines.length} products · {totals.units} units
                </p>
              </div>
              <button
                type="button"
                onClick={() => toast.success(`Stock is available at ${lineWarehouse}.`)}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600"
              >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Stock available
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-center">
              <label className="relative min-w-0 flex-1">
                <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search product, SKU, or barcode"
                  className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
                />
                {matches.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    {matches.map((product) => (
                      <button
                        key={product.sku}
                        type="button"
                        onClick={() => addProduct(product)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="text-slate-800">{product.name}</span>
                        <span className="font-mono text-xs text-slate-400">{product.sku}</span>
                      </button>
                    ))}
                  </div>
                )}
              </label>
              <div className="w-full lg:w-48">
                <Select value={lineWarehouse} options={warehouses} onChange={setLineWarehouse} />
              </div>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <Plus size={15} />
                Add line
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                    <th className="py-2 pr-3 font-semibold">Product</th>
                    <th className="px-2 py-2 text-right font-semibold">Qty</th>
                    <th className="px-2 py-2 font-semibold">Unit</th>
                    <th className="px-2 py-2 text-right font-semibold">Price (PKR)</th>
                    <th className="px-2 py-2 text-right font-semibold">Discount</th>
                    <th className="px-2 py-2 text-right font-semibold">Tax</th>
                    <th className="py-2 pl-2 text-right font-semibold">Total (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((item) => {
                    const gross = item.qty * item.price
                    const net = gross * (1 - item.discount / 100)
                    const calculated = net * (1 + item.tax / 100)
                    const total = usingPreview && previewTotals[item.sku] != null ? previewTotals[item.sku] : calculated
                    return (
                      <tr key={item.sku} className="border-t border-slate-100">
                        <td className="py-3 pr-3 text-[13px] text-slate-600">
                          {item.name} · {item.sku}
                        </td>
                        <td className="px-2 py-3 text-right">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(event) => updateLine(item.sku, 'qty', Math.max(1, Number(event.target.value) || 1))}
                            className="w-12 appearance-none bg-transparent text-right text-[13px] text-slate-700 outline-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </td>
                        <td className="px-2 py-3 text-[13px] text-slate-500">{item.unit}</td>
                        <td className="px-2 py-3 text-right text-[13px] text-slate-600">{money(item.price)}</td>
                        <td className="px-2 py-3 text-right text-[13px] text-slate-500">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(event) =>
                              updateLine(item.sku, 'discount', Math.min(100, Math.max(0, Number(event.target.value) || 0)))
                            }
                            className="w-8 appearance-none bg-transparent text-right text-[13px] text-slate-500 outline-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          %
                        </td>
                        <td className="px-2 py-3 text-right text-[13px] text-slate-500">{item.tax}%</td>
                        <td className="py-3 pl-2 text-right text-[13px] text-slate-700">{money(total)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Customer reference" value={reference} onChange={setReference} />
              <Field label="Internal note" value={note} onChange={setNote} />
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Document details</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs text-slate-400">Sale date</span>
                <input
                  value={saleDate}
                  onChange={(event) => setSaleDate(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
                />
              </label>
              <Select label="Terms" value={term} options={terms} onChange={setTerm} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Sale totals</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={`PKR ${money(summary.subtotal)}`} />
              <Row label="Discount" value={`−PKR ${money(summary.discount)}`} valueClass="text-rose-500" />
              <Row label="Tax (5%)" value={`PKR ${money(summary.tax)}`} />
              <Row label="Shipping" value={`PKR ${money(shipping)}`} />
              <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                <dt className="text-sm font-medium text-slate-700">Grand total</dt>
                <dd className="text-xl font-semibold tracking-tight text-slate-900">PKR {money(grand)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Payment & shipment</h2>
            <div className="mt-4 space-y-4">
              <Select label="Payment state" value={paymentState} options={paymentStates} onChange={setPaymentState} />
              <label className="block">
                <span className="text-xs text-slate-400">Received by bank</span>
                <input
                  value={
                    paymentState === 'Paid'
                      ? `PKR ${money(grand)}`
                      : paymentState === 'Unpaid'
                        ? 'PKR 0.00'
                        : received.startsWith('PKR')
                          ? received
                          : `PKR ${money(Number(received) || 0)}`
                  }
                  disabled={paymentState !== 'Partially paid (PKR)'}
                  onChange={(event) => setReceived(event.target.value.replace(/[^\d.]/g, ''))}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 disabled:bg-slate-50"
                />
              </label>
              <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-500">
                Receivable PKR {money(outstanding)}
              </p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-700">Create shipment after posting</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={createShipment}
                  aria-label="Create shipment after posting"
                  onClick={() => setCreateShipment((current) => !current)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${createShipment ? 'bg-[#2f6fed]' : 'bg-slate-200'}`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${createShipment ? 'left-5' : 'left-0.5'}`}
                  />
                </button>
              </div>
              {createShipment ? <Select value={shipment} options={shipmentOptions} onChange={setShipment} /> : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, valueClass = 'text-slate-700' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className={valueClass}>{value}</dd>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
      />
    </label>
  )
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      {label ? <span className="text-xs text-slate-400">{label}</span> : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${label ? 'mt-1.5' : ''} w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400`}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

export default NewSalePage
