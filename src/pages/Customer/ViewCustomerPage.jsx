import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCustomer } from '../../queries/customers/customers.queries.js'
import {
  customerAccountNote,
  customerNote,
  display,
  formatMoney,
  mapCustomer,
  statusClassName,
} from './customerRecords.js'

function ViewCustomerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const customerQuery = useCustomer(id)
  const customer = customerQuery.data?.data ? mapCustomer(customerQuery.data.data) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase"
          >
            <span>Sales</span>
            <span>/</span>
            <Link to="/sales/customers" className="hover:text-slate-700">
              Customers
            </Link>
            <span>/</span>
            <span className="text-slate-700">Detail</span>
          </nav>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-[32px] leading-none font-semibold tracking-tight text-slate-900">
              {customer?.name || 'Customer'}
            </h1>
            {customer && (
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(customer.status)}`}
              >
                {customer.status}
              </span>
            )}
          </div>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            {customer
              ? `${display(customer.code)} · ${display(customer.paymentTermsLabel)} · ${display(customer.currency)}`
              : 'Customer identity, commercial terms, and receivable mapping.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/sales/customers"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Back to Customers
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/sales/customers/${id}/edit`)}
            className="cursor-pointer rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Edit Customer
          </button>
        </div>
      </div>

      {customerQuery.isLoading && <Panel>Loading customer...</Panel>}
      {customerQuery.isError && (
        <Panel className="text-rose-500">
          {customerQuery.error.response?.data?.message || 'Could not load this customer.'}
        </Panel>
      )}

      {customer && (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Customer information</h2>
              <p className="mt-0.5 text-sm text-slate-400">Profile, contact, and commercial terms</p>

              <DetailSection title="Identity">
                <Fact label="Customer name" value={display(customer.name)} />
                <Fact label="Customer code" value={display(customer.code)} />
                <Fact label="Contact name" value={display(customer.contactName)} />
                <Fact label="Status" value={customer.status} />
              </DetailSection>

              <DetailSection title="Contact">
                <Fact label="Email" value={display(customer.email)} />
                <Fact label="Phone" value={display(customer.phone)} muted={!customer.phone} />
                <Fact label="Address" value={display(customer.address)} />
              </DetailSection>

              <DetailSection title="Commercial terms" columns="xl:grid-cols-3">
                <Fact label="Currency" value={display(customer.currency)} />
                <Fact
                  label="Credit limit"
                  value={formatMoney(customer.creditLimit, customer.currency)}
                />
                <Fact
                  label="Available credit"
                  value={formatMoney(customer.availableCredit, customer.currency)}
                />
                <Fact label="Payment terms" value={display(customer.paymentTermsLabel)} />
                <Fact label="Receivable account" value={display(customer.receivableAccount)} />
                <Fact label="AR / AP account" value={display(customer.arApAccount)} />
              </DetailSection>

              <DetailSection title="Balances" columns="xl:grid-cols-3">
                <Fact label="Receivable" value={formatMoney(customer.receivable)} />
                <Fact label="Payable" value={formatMoney(customer.payable)} />
                <Fact label="Outstanding" value={formatMoney(customer.outstanding)} />
              </DetailSection>

              <DetailSection title="Notes">
                <Fact label="Internal notes" value={display(customer.notes)} />
              </DetailSection>
            </section>

            <section className="rounded-2xl border border-[#d7e6ff] bg-[#eef4ff] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#2f6fed]">Accounting note</h2>
              <p className="mt-1 text-[13px] leading-5 text-slate-500">
                {customer.balanceNote || customerNote}
              </p>
            </section>
          </div>

          <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
            <h2 className="text-[18px] font-semibold text-slate-900">{display(customer.name)}</h2>
            <p className="mt-1 text-[13px] text-slate-400">{display(customer.code)}</p>
            <div className="mt-3">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(customer.status)}`}
              >
                {customer.status}
              </span>
            </div>
            <dl className="mt-5 space-y-3.5">
              <SideFact label="Created on" value={customer.createdOn} />
              <SideFact label="Updated" value={customer.updatedOn} />
              <SideFact label="Record status" value={customer.status} />
              <SideFact
                label="Credit limit"
                value={formatMoney(customer.creditLimit, customer.currency)}
              />
            </dl>
            <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
              <p className="text-[13px] font-semibold text-[#2f6fed]">Party accounts</p>
              <p className="mt-1 text-[13px] leading-5 text-slate-600">{customerAccountNote}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
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

function DetailSection({ title, columns = 'xl:grid-cols-4', children }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-[#2f6fed]">{title}</h3>
      <div className={`mt-3 grid gap-4 sm:grid-cols-2 ${columns}`}>{children}</div>
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

export default ViewCustomerPage
