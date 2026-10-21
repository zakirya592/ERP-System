import { useEffect, useMemo, useState } from 'react'
import { Check, Minus, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import ExportButton from '../../../components/ExportButton.jsx'
import { getPermissions } from '../../../api/permissions.api.js'
import { usePermissions } from '../../../queries/permissions/permissions.queries.js'
import { fetchAllPages } from '../../../utils/exportExcel.js'

const limit = 20

const actionOrder = ['create', 'read', 'update', 'delete', 'approve', 'post', 'all']

const exportColumns = [
  { key: 'module', label: 'Module' },
  { key: 'action', label: 'Action' },
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
]

function titleCase(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildMatrix(permissions) {
  const modules = []
  const moduleIndex = new Map()
  const actions = new Set()

  permissions.forEach((permission) => {
    const moduleKey = permission.module || 'other'
    const actionKey = permission.action || 'other'
    actions.add(actionKey)

    if (!moduleIndex.has(moduleKey)) {
      moduleIndex.set(moduleKey, modules.length)
      modules.push({ key: moduleKey, label: titleCase(moduleKey), actions: new Set() })
    }

    modules[moduleIndex.get(moduleKey)].actions.add(actionKey)
  })

  const columns = [
    ...actionOrder.filter((action) => actions.has(action)),
    ...[...actions].filter((action) => !actionOrder.includes(action)).sort(),
  ]

  return { modules, columns }
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

function PermissionsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const permissionsQuery = usePermissions({ page, limit, search: debouncedSearch })
  const permissions = permissionsQuery.data?.data || []
  const total = permissionsQuery.data?.meta?.total ?? permissions.length
  const pageCount = Math.max(1, Math.ceil(total / limit))
  const { modules, columns } = useMemo(() => buildMatrix(permissions), [permissions])

  const message = permissionsQuery.isError
    ? permissionsQuery.error.response?.data?.message || 'Could not load permissions.'
    : permissionsQuery.isLoading
      ? 'Loading permissions...'
      : 'No permissions match this search.'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link to="/dashboard" className="text-sm font-medium text-slate-700 hover:text-slate-700">
            Dashboard
          </Link>
          <span>/</span>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Users & Security</p>
        </nav>
        <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Permissions</h1>
        <p className="mt-2 text-sm text-slate-500">Actions available on each module.</p>
        </div>
        <ExportButton
          filename="permissions"
          sheetName="Permissions"
          columns={exportColumns}
          loadRows={() => fetchAllPages(getPermissions, { search: debouncedSearch })}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">Permissions matrix</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {total} {total === 1 ? 'permission' : 'permissions'}
            </p>
          </div>
          <label className="relative w-full sm:w-64">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search code or module"
              className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
            />
          </label>
        </div>

        {modules.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">{message}</p>
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
                        <Mark granted={module.actions.has(action)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
            <p>
              Page {page} of {pageCount}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default PermissionsPage
