import { Building2, Calendar, Clock, Mail, Phone, Shield, Warehouse } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useUser } from '../../../queries/users/users.queries'

const statusClass = {
  active: 'bg-emerald-50 text-emerald-600',
  inactive: 'bg-slate-100 text-slate-500',
}

function formatWhen(value) {
  if (!value) return 'Never'
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return 'U'
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function itemLabel(item) {
  if (typeof item === 'string') return item
  return item?.name || item?.code || item?._id || ''
}

function ViewUserPage() {
  const { id } = useParams()
  const userQuery = useUser(id)
  const user = userQuery.data?.data
  const roles = user?.roleIds || []
  const branches = user?.branchIds || []
  const warehouses = user?.warehouseIds || []

  return (
    <div className="space-y-4">
      <div>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link to="/dashboard" className="hover:text-slate-700">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/users/users" className="hover:text-slate-700">
            User
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">View User</span>
        </nav>
      
      </div>

      {userQuery.isLoading && (
        <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-10 text-sm text-slate-400 shadow-sm">
          Loading user...
        </section>
      )}

      {userQuery.isError && (
        <section className="rounded-2xl border border-rose-100 bg-white px-6 py-8 text-sm text-rose-500 shadow-sm">
          {userQuery.error.response?.data?.message || 'Could not load this user.'}
        </section>
      )}

      {user && (
        <>
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1d4ed8] text-lg font-semibold text-white">
                  {initials(user.name)}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[26px] leading-none font-semibold tracking-tight text-slate-900">
                      {user.name}
                    </h1>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize ${
                        statusClass[user.status] || 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="grid border-t border-slate-100 sm:grid-cols-3">
              <Stat icon={Clock} label="Last login" value={formatWhen(user.lastLoginAt)} />
              <Stat icon={Calendar} label="Created" value={formatWhen(user.createdAt)} />
              <Stat icon={Calendar} label="Updated" value={formatWhen(user.updatedAt)} />
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Account</h2>
              <dl className="mt-4 divide-y divide-slate-100">
                <Row icon={Mail} label="Email" value={user.email} />
                <Row icon={Phone} label="Phone" value={user.phone} />
                <Row icon={Shield} label="Employee" value={user.employeeId ? String(user.employeeId) : 'Not linked'} />
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Access</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-400">Roles</p>
                  {roles.length ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {roles.map((role) => (
                        <li
                          key={role._id || role.name}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <p className="text-sm font-medium text-slate-800">{role.name || '—'}</p>
                          {role.code && <p className="text-xs text-slate-400">{role.code}</p>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">No role assigned</p>
                  )}
                </div>
                <Assignment icon={Building2} label="Branches" items={branches} empty="No branches assigned" />
                <Assignment icon={Warehouse} label="Warehouses" items={warehouses} empty="No warehouses assigned" />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 border-slate-100 px-6 py-4 sm:border-l sm:first:border-l-0">
      <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        <Icon size={15} />
      </span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  )
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-slate-400">{label}</dt>
        <dd className="truncate text-sm font-medium text-slate-800">{value || '—'}</dd>
      </div>
    </div>
  )
}

function Assignment({ icon: Icon, label, items, empty }) {
  const labels = items.map(itemLabel).filter(Boolean)

  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-800">{labels.length ? labels.join(', ') : empty}</p>
      </div>
    </div>
  )
}

export default ViewUserPage
