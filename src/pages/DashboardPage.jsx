import { Calendar, ChevronDown, Receipt, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { useState } from 'react'

const metrics = [
  {
    label: 'Revenue',
    value: 'PKR 428,680',
    change: '+12.4%',
    changeClass: 'text-emerald-500',
    icon: TrendingUp,
    iconClass: 'text-emerald-500',
  },
  {
    label: 'Purchases',
    value: 'PKR 247,320',
    change: '+4.8%',
    changeClass: 'text-sky-500',
    icon: ShoppingCart,
    iconClass: 'text-sky-500',
  },
  {
    label: 'Expenses',
    value: 'PKR 71,940',
    change: '-2.1%',
    changeClass: 'text-rose-500',
    icon: Receipt,
    iconClass: 'text-emerald-500',
  },
  {
    label: 'Receivables',
    value: 'PKR 96,240',
    change: '18 overdue',
    changeClass: 'text-amber-500',
    icon: Wallet,
    iconClass: 'text-amber-500',
    changeAside: true,
  },
]

const salesWeeks = [
  { height: 64 },
  { height: 56 },
  { height: 44 },
  { height: 50 },
  { height: 74 },
  { height: 100, current: true },
]

const stock = [
  { label: 'Healthy', value: '3,081', width: '87.8%', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  { label: 'Low stock', value: '348', width: '9.9%', dot: 'bg-amber-400', bar: 'bg-amber-400' },
  { label: 'Out of stock', value: '79', width: '2.3%', dot: 'bg-rose-500', bar: 'bg-rose-500' },
]

const lowStock = [
  { sku: 'BEV-1042', product: 'Arabica Coffee 1 kg', available: '10 bag', reorder: '40', status: 'Critical' },
  { sku: 'CLN-2201', product: 'Floor Cleaner 5 L', available: '15 pcs', reorder: '24', status: 'Low' },
  { sku: 'PKG-3710', product: 'Paper Carry Bag L', available: '80 pcs', reorder: '120', status: 'Low' },
  { sku: 'DRY-0814', product: 'Basmati Rice 20 kg', available: '7 bag', reorder: '15', status: 'Critical' },
]

const approvals = [
  { id: 'PO-10241', detail: 'Purchase · PKR 18,400', level: 'High' },
  { id: 'EX-33108', detail: 'Expense · PKR 6,200', level: 'Normal' },
  { id: 'TR-08402', detail: 'Transfer · All only', level: 'Normal' },
]

const activity = [
  { color: 'bg-emerald-500', text: 'Sale posted · INV-4380' },
  { color: 'bg-sky-500', text: 'Receipt recorded · RCV-2190 · PKR 4,280' },
  { color: 'bg-amber-400', text: 'Payment posted · PAY-0150 · PKR 8,600' },
  { color: 'bg-slate-400', text: 'Price updated · SKU-1042' },
]

function DashboardPage() {
  const [branch, setBranch] = useState('Central Branch')

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-[28px] leading-none font-semibold tracking-tight text-slate-900">
            Executive Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Operating performance, stock exposure, and approvals across {branch}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <select
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-3 text-sm text-slate-700 shadow-sm outline-none focus:border-sky-400"
            >
              <option>Central Branch</option>
              <option>North Branch</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
            />
          </label>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
            <Calendar size={14} className="text-slate-400" />
            Sep 01 - Sep 30, 2026
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="grid items-stretch gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">Sales trend</h2>
              <p className="mt-0.5 text-xs text-slate-400">Net sales by week · September · PKR</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-emerald-600">
              +PKR 47.2k vs Aug
            </span>
          </div>
          <div className="mt-6 flex h-36 items-end gap-3">
            {salesWeeks.map((week, index) => (
              <div
                key={index}
                className={`min-w-0 flex-1 rounded-t-md ${week.current ? 'bg-[#2563eb]' : 'bg-[#b7d4fb]'}`}
                style={{ height: `${week.height}%` }}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-slate-400">
            <span>Sep 01</span>
            <span>Sep 30</span>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-[15px] font-semibold text-slate-900">Stock health</h2>
          <p className="mt-0.5 text-xs text-slate-400">3,584 active SKUs</p>
          <div className="mt-5 flex h-2 overflow-hidden rounded-full">
            {stock.map((item) => (
              <div key={item.label} className={item.bar} style={{ width: item.width }} />
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {stock.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className={`size-2 rounded-full ${item.dot}`} />
                  {item.label}
                </span>
                <span className="font-medium text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </article>

      </div>

      <div className="grid items-start gap-3 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm col-span-2">
          <h2 className="text-[15px] font-semibold text-slate-900">Low-stock items</h2>
          <table className="mt-3 w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] tracking-[0.12em] text-slate-400 uppercase">
                <th className="py-2 pr-2 font-medium">SKU</th>
                <th className="py-2 pr-2 font-medium">Product</th>
                <th className="py-2 pr-2 font-medium">Available</th>
                <th className="py-2 pr-2 font-medium">Reorder</th>
                <th className="py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((item) => (
                <tr key={item.sku} className="border-t border-slate-100">
                  <td className="py-2.5 pr-2 whitespace-nowrap text-slate-500">{item.sku}</td>
                  <td className="py-2.5 pr-2 font-medium text-slate-800">{item.product}</td>
                  <td className="py-2.5 pr-2 whitespace-nowrap text-slate-600">{item.available}</td>
                  <td className="py-2.5 pr-2 whitespace-nowrap text-slate-600">{item.reorder}</td>
                  <td className="py-2.5 text-right whitespace-nowrap">
                    <StatusPill value={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-[15px] font-semibold text-slate-900">Approvals queue</h2>
          <p className="mt-0.5 text-xs text-slate-400">3 pending</p>
          <div className="mt-4 space-y-3">
            {approvals.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.id}</p>
                  <p className="text-xs text-slate-400">{item.detail}</p>
                </div>
                <StatusPill value={item.level} />
              </div>
            ))}
          </div>
        </article>


      </div>
      <div className="grid items-start gap-3 xl:grid-cols-2">
       <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
          <h2 className="text-[15px] font-semibold text-slate-900">Cash & bank</h2>
          <p className="mt-0.5 text-xs text-slate-400">Available now</p>
          <p className="mt-5 text-[26px] leading-none font-semibold tracking-tight text-slate-900">
            PKR 34,860 <span className="text-base font-medium text-slate-500">cash</span>
          </p>
          <div className="mt-5 space-y-2 text-sm text-slate-500">
            <p>Meridian Bank · PKR 286,400</p>
            <p>Commerce Trust · PKR 91,250</p>
          </div>
        </article>
        <article className='rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm'>
          <h2 className='text-[15px] font-semibold text-slate-900'>Recent activity</h2>
          <div className='mt-4 space-y-3'>
            {activity.map(item => (
              <p
                key={item.text}
                className='flex items-start gap-2.5 text-sm text-slate-600'
              >
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.color}`} />
                <span>{item.text}</span>
              </p>
            ))}
          </div>
        </article>

      </div>
    </div>
  )
}

function MetricCard({ metric }) {
  const Icon = metric.icon

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
          {metric.label}
        </p>
        <Icon size={16} className={metric.iconClass} />
      </div>
      {metric.changeAside ? (
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-[26px] leading-none font-semibold tracking-tight text-slate-900">
            {metric.value}
          </p>
          <p className={`mb-0.5 text-xs font-medium whitespace-nowrap ${metric.changeClass}`}>
            {metric.change}
          </p>
        </div>
      ) : (
        <>
          <p className="mt-3 text-[26px] leading-none font-semibold tracking-tight text-slate-900">
            {metric.value}
          </p>
          <p className={`mt-2 text-xs font-medium ${metric.changeClass}`}>{metric.change}</p>
        </>
      )}
    </article>
  )
}

function StatusPill({ value }) {
  const tone =
    value === 'Critical' || value === 'High'
      ? 'bg-rose-50 text-rose-600'
      : value === 'Low'
        ? 'bg-amber-50 text-amber-600'
        : 'bg-slate-100 text-slate-500'

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {value}
    </span>
  )
}

export default DashboardPage
