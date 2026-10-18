import { useMemo } from 'react'
import { Check, Minus } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { usePermissions } from '../../../queries/permissions/permissions.queries'
import { useRole } from '../../../queries/roles/roles.queries'

const actionOrder = ['create', 'read', 'update', 'delete', 'approve', 'post', 'all']

const statusClass = {
  active: 'bg-emerald-50 text-emerald-600',
  inactive: 'bg-slate-100 text-slate-500',
}

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return 'R'
  if (parts.length === 1 && parts[0].length <= 3) return parts[0].toUpperCase()
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function titleCase(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildMatrix(permissions, assignedIds) {
  const modules = []
  const moduleIndex = new Map()
  const actions = new Set()

  permissions.forEach((permission) => {
    const moduleKey = permission.module || 'other'
    const actionKey = permission.action || 'other'
    actions.add(actionKey)

    if (!moduleIndex.has(moduleKey)) {
      moduleIndex.set(moduleKey, modules.length)
      modules.push({ key: moduleKey, label: titleCase(moduleKey), granted: {} })
    }

    modules[moduleIndex.get(moduleKey)].granted[actionKey] = assignedIds.has(permission._id)
  })

  const columns = [
    ...actionOrder.filter((action) => actions.has(action)),
    ...[...actions].filter((action) => !actionOrder.includes(action)).sort(),
  ]

  return { modules, columns }
}

function ViewRolePage() {
  const { id } = useParams()
  const roleQuery = useRole(id)
  const permissionsQuery = usePermissions({ page: 1, limit: 100, search: '' })
  const role = roleQuery.data?.data
  const assigned = role?.permissionIds || []
  const assignedIds = useMemo(() => new Set(assigned.map((item) => item._id || item)), [assigned])
  const catalog = permissionsQuery.data?.data?.length ? permissionsQuery.data.data : assigned
  const { modules, columns } = useMemo(() => buildMatrix(catalog, assignedIds), [catalog, assignedIds])

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
        <Link to="/dashboard" className="hover:text-slate-700">
          Dashboard
        </Link>
        <span>/</span>
        <Link to="/users/roles" className="hover:text-slate-700">
          Roles
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-700">View Role</span>
      </nav>

      {roleQuery.isLoading && (
        <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-10 text-sm text-slate-400 shadow-sm">
          Loading role...
        </section>
      )}

      {roleQuery.isError && (
        <section className="rounded-2xl border border-rose-100 bg-white px-6 py-8 text-sm text-rose-500 shadow-sm">
          {roleQuery.error.response?.data?.message || 'Could not load this role.'}
        </section>
      )}

      {role && (
        <>
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1d4ed8] text-lg font-semibold text-white">
                  {initials(role.name)}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[26px] leading-none font-semibold tracking-tight text-slate-900">{role.name}</h1>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize ${
                        statusClass[role.status] || 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {role.status}
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono text-sm text-slate-500">{role.code}</p>
                </div>
              </div>
              <Link
                to={`/users/roles/${role._id}/edit`}
                className="inline-flex w-fit rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white"
              >
                Update
              </Link>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-[15px] font-semibold text-slate-900">Permissions matrix</h2>
              <p className="mt-0.5 text-sm text-slate-400">{role.name}</p>
            </div>

            {modules.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-400">
                {permissionsQuery.isLoading ? 'Loading permissions...' : 'No permissions assigned.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 text-[13px] text-slate-400">
                      <th className="px-5 py-3 text-left font-medium">Module</th>
                      {columns.map((action) => (
                        <th key={action} className="px-3 py-3 text-center font-medium">
                          {titleCase(action)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((module) => (
                      <tr key={module.key} className="border-t border-slate-100">
                        <td className="px-5 py-3.5 text-[13px] font-medium text-slate-700">{module.label}</td>
                        {columns.map((action) => (
                          <td key={action} className="px-3 py-3.5 text-center">
                            <Mark granted={Boolean(module.granted[action])} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function Mark({ granted }) {
  if (granted) {
    return (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <Check size={15} strokeWidth={2.5} />
      </span>
    )
  }

  return (
    <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-300">
      <Minus size={14} strokeWidth={2.5} />
    </span>
  )
}

export default ViewRolePage
