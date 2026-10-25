import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useSupplier } from '../../queries/suppliers/suppliers.queries.js'
import {
  display,
  formatAsOf,
  mapSupplier,
  money,
  moneyLabel,
  statusClassName,
} from './supplierRecords.js'

function ViewSupplierPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const supplierQuery = useSupplier(id)
  const supplier = supplierQuery.data?.data ? mapSupplier(supplierQuery.data.data) : null
  const asOf = formatAsOf(supplierQuery.data?.data?.payablesActivity?.asOf || supplierQuery.data?.meta?.summary?.asOf)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase"
          >
            <span>Purchases</span>
            <span>/</span>
            <Link to="/purchases/suppliers" className="hover:text-slate-700">
              Suppliers
            </Link>
            <span>/</span>
            <span className="text-slate-700">Detail</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">
            {supplier?.name || 'Supplier'}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Supplier contact, commercial terms, and payable activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/purchases/suppliers"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Back to Suppliers
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/purchases/suppliers/${id}/edit`)}
            className="rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Edit Supplier
          </button>
        </div>
      </div>

      {supplierQuery.isLoading && <Panel>Loading supplier...</Panel>}
      {supplierQuery.isError && (
        <Panel className="text-rose-500">
          {supplierQuery.error.response?.data?.message || 'Could not load this supplier.'}
        </Panel>
      )}

      {supplier && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Outstanding" value={moneyLabel(supplier.outstanding, supplier.currency)} />
            <Stat label="Current" value={moneyLabel(supplier.current, supplier.currency)} />
            <Stat label="Overdue" value={moneyLabel(supplier.overdue, supplier.currency)} />
            <Stat
              label="Unallocated advance"
              value={moneyLabel(supplier.unallocated, supplier.currency)}
            />
          </section>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Supplier information</h2>
                <p className="mt-0.5 text-sm text-slate-400">Profile, terms, and account mapping</p>

                <DetailSection title="Identity & contact">
                  <Fact label="Supplier name" value={display(supplier.name)} />
                  <Fact label="Supplier code" value={display(supplier.code)} />
                  <Fact label="Phone" value={display(supplier.phone)} muted={!supplier.phone} />
                  <Fact label="Email" value={display(supplier.email)} muted={!supplier.email} />
                  <Fact label="Address" value={display(supplier.address)} />
                </DetailSection>

                <DetailSection title="Commercial terms">
                  <Fact label="Preferred currency" value={display(supplier.currency)} />
                  <Fact label="Payment terms" value={display(supplier.terms)} />
                  <Fact label="Payable account" value={display(supplier.account)} />
                  <Fact label="Status" value={supplier.status} />
                </DetailSection>

                <DetailSection title="Notes">
                  <Fact label="Internal notes" value={display(supplier.notes)} />
                </DetailSection>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Purchase ledger</h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      As of {asOf} · {supplier.currency}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success(`Payables opened for ${supplier.name}.`)}
                    className="text-sm font-medium text-sky-600"
                  >
                    View Payables
                  </button>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-[11px] tracking-wide text-slate-400 uppercase">
                      <tr className="border-b border-slate-100">
                        <th className="py-2 font-medium">Purchase</th>
                        <th className="py-2 font-medium">Due</th>
                        <th className="py-2 text-right font-medium">Amount</th>
                        <th className="py-2 text-right font-medium">Paid</th>
                        <th className="py-2 text-right font-medium">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!supplier.bills.length ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                            No posted bills for this supplier.
                          </td>
                        </tr>
                      ) : (
                        supplier.bills.map((bill) => (
                          <tr key={bill.id} className="border-b border-slate-100 last:border-b-0">
                            <td className="py-2 font-medium text-sky-600">{bill.id}</td>
                            <td className="py-2 text-slate-500">{bill.date}</td>
                            <td className="py-2 text-right text-slate-700">{money(bill.amount)}</td>
                            <td className="py-2 text-right text-slate-700">{money(bill.paid)}</td>
                            <td className="py-2 text-right text-slate-700">{money(bill.balance)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {supplier.allocation && (
                  <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3">
                    <p className="text-sm font-semibold text-emerald-700">
                      {supplier.allocation.id} ·{' '}
                      {moneyLabel(supplier.allocation.amount, supplier.currency)} allocated
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{supplier.allocation.detail}</p>
                  </div>
                )}
              </section>
            </div>

            <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
              <h2 className="text-[18px] font-semibold text-slate-900">{display(supplier.name)}</h2>
              <p className="mt-1 text-[13px] text-slate-400">{display(supplier.code)}</p>
              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(supplier.status)}`}
                >
                  {supplier.status}
                </span>
              </div>
              <dl className="mt-5 space-y-3.5">
                <SideFact label="Payable account" value={display(supplier.account)} />
                <SideFact label="Created on" value={supplier.createdOn} />
                <SideFact label="Updated" value={supplier.updatedOn} />
                <SideFact label="Record status" value={supplier.status} />
              </dl>
              <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
                <p className="text-[13px] font-semibold text-[#2f6fed]">Payable balances</p>
                <p className="mt-1 text-[13px] leading-5 text-slate-600">
                  {supplier.balanceNote ||
                    'Balances come from posted purchases and payments. Creating a supplier does not create a balance.'}
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
    </article>
  )
}

function Panel({ children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center text-sm font-semibold shadow-sm ${className}`}
    >
      {children}
    </section>
  )
}

function DetailSection({ title, children }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-[#2f6fed]">{title}</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  )
}

function Fact({ label, value, muted = false }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] text-slate-400">{label}</p>
      <p className={`mt-1 text-[14px] font-medium ${muted ? 'text-slate-400' : 'text-slate-800'}`}>
        {value}
      </p>
    </div>
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

export default ViewSupplierPage
