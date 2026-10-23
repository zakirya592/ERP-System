import { ChevronDown } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { statusClassName } from './partnershipRecords.js'

export const organizationTabs = [
  { label: 'Branches', to: '/organization/branches' },
  { label: 'Shops', to: '/organization/shop' },
  { label: 'Warehouses', to: '/organization/warehouses' },
  { label: 'Employees', to: '/organization/employees' },
  { label: 'Owners', to: '/organization/owners' },
  { label: 'Partnerships', to: '/organization/partnerships' },
]

export function OrganizationTabs() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="flex flex-wrap gap-2">
      {organizationTabs.map((tab) => {
        const selected = pathname === tab.to || pathname.startsWith(`${tab.to}/`)
        return (
          <button
            key={tab.to}
            type="button"
            onClick={() => navigate(tab.to)}
            className={
              selected
                ? 'cursor-pointer rounded-lg bg-[#e8f1ff] px-3 py-1.5 text-sm font-medium text-[#2f6fed]'
                : 'cursor-pointer rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-white'
            }
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(status)}`}>
      {status || '—'}
    </span>
  )
}

export function Stat({ label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
    </article>
  )
}

export function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-[13px] text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-[14px] font-medium text-slate-800">{value || '—'}</dd>
    </div>
  )
}

export function Field({ label, required = false, value, error, placeholder, type = 'text', onChange, onBlur }) {
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
        onBlur={onBlur}
        className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 ${
          error ? 'border-rose-300' : 'border-slate-200'
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

export function SelectField({ label, required = false, value, error, placeholder, options, onChange }) {
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
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value
            const label = typeof option === 'string' ? option : option.label
            const key = typeof option === 'string' ? option : option.key || option.value
            return (
              <option key={key} value={value}>
                {label}
              </option>
            )
          })}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
      </span>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

export function FormCard({ title, children, columns = 'md:grid-cols-2' }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className={`mt-4 grid gap-4 ${columns}`}>{children}</div>
    </section>
  )
}
