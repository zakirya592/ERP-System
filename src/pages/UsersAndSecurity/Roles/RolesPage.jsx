import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { Eye, Pencil, Plus, Search } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { useRoleList } from '../../../queries/roles/roles.queries.js'

const limit = 20

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const statusClass = {
  active: 'bg-emerald-50 text-emerald-600',
  inactive: 'bg-slate-100 text-slate-500',
}

function formatWhen(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const actionOrder = ['create', 'read', 'update', 'delete', 'approve', 'post', 'all']

function titleCase(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function groupPermissions(permissions) {
  const groups = []
  const index = new Map()

  ;(permissions || []).forEach((permission) => {
    const moduleKey = permission.module || permission.code?.split('.')[0] || 'other'
    const action = permission.action || permission.code?.split('.')[1] || permission.code
    if (!action) return

    if (!index.has(moduleKey)) {
      index.set(moduleKey, groups.length)
      groups.push({ key: moduleKey, label: titleCase(moduleKey), actions: [] })
    }

    const group = groups[index.get(moduleKey)]
    if (!group.actions.includes(action)) group.actions.push(action)
  })

  groups.forEach((group) => {
    group.actions.sort((left, right) => {
      const leftIndex = actionOrder.indexOf(left)
      const rightIndex = actionOrder.indexOf(right)
      return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex)
    })
  })

  return groups
}

function PermissionCell({ permissions }) {
  const groups = groupPermissions(permissions)
  const [tip, setTip] = useState(null)
  const count = (permissions || []).length

  if (!groups.length) return <span className="text-[13px] text-slate-400">—</span>

  function show(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = 240
    setTip({
      top: rect.bottom + 8,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
    })
  }

  return (
    <>
      <button
        type="button"
        onMouseEnter={show}
        onMouseLeave={() => setTip(null)}
        onFocus={show}
        onBlur={() => setTip(null)}
        className="cursor-default text-[13px] text-slate-600 underline decoration-dotted decoration-slate-300 underline-offset-4"
      >
        {count} {count === 1 ? 'permission' : 'permissions'}
      </button>
      {tip &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: tip.top, left: tip.left }}
            className="pointer-events-none fixed z-50 w-60 rounded-lg bg-slate-900 px-3 py-2 text-left shadow-lg"
          >
            <span className="absolute -top-1 left-4 size-2 rotate-45 bg-slate-900" />
            <ul className="space-y-1">
              {groups.map((group) => (
                <li key={group.key} className="text-[12px] leading-4 text-white">
                  <span className="font-medium">{group.label}</span>
                  <span className="text-slate-300"> · {group.actions.map(titleCase).join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </>
  )
}

const roleColumns = [
  {
    key: 'name',
    label: 'NAME',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.name}</span>,
  },
  {
    key: 'code',
    label: 'CODE',
    renderCell: (item) => <span className="font-mono text-[12px] text-slate-500">{item.code || '—'}</span>,
  },
  {
    key: 'permissions',
    label: 'PERMISSIONS',
    renderCell: (item) => <PermissionCell permissions={item.permissionIds} />,
  },
  {
    key: 'status',
    label: 'STATUS',
    renderCell: (item) => (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize ${
          statusClass[item.status] || 'bg-slate-100 text-slate-500'
        }`}
      >
        {item.status || '—'}
      </span>
    ),
  },
  {
    key: 'updatedAt',
    label: 'UPDATED',
    renderCell: (item) => <span className="text-[13px] text-slate-500">{formatWhen(item.updatedAt)}</span>,
  },
]

function RolesPage() {
  const navigate = useNavigate()
  const columns = [
    ...roleColumns,
    {
      key: 'action',
      label: 'ACTION',
      renderCell: (item) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`View ${item.name}`}
            onClick={() => navigate(`/users/roles/${item._id}`)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            aria-label={`Update ${item.name}`}
            onClick={() => navigate(`/users/roles/${item._id}/edit`)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Pencil size={16} />
          </button>
        </div>
      ),
    },
  ]
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  const rolesQuery = useRoleList({ page, limit, search: debouncedSearch, status })
  const roles = (rolesQuery.data?.data || []).map((role) => ({ ...role, id: role._id }))
  const total = rolesQuery.data?.meta?.total ?? roles.length

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link to="/dashboard" className="hover:text-slate-700 text-sm font-medium text-slate-700">
            Dashboard
          </Link>
         
          <span>/</span>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Users & Security</p>
        </nav>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Roles</h1>
          <p className="mt-2 text-sm text-slate-500">Roles and the permissions assigned to each one.</p>
        </div>
        <Button size="sm" onPress={() => navigate('/users/roles/new')}>
          <Plus size={15} />
          Add Role
        </Button>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Role list</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            {total} {total === 1 ? 'role' : 'roles'}
          </p>
        </div>

        <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or code"
              className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          >
            {statusOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <GlobalTable
          ariaLabel="Roles"
          columns={columns}
          data={roles}
          pagination
          rowsPerPage={limit}
          page={page}
          totalCount={total}
          onPageChange={setPage}
          className="h-auto! max-h-none!"
          emptyContent={
            rolesQuery.isError
              ? rolesQuery.error.response?.data?.message || 'Could not load roles.'
              : rolesQuery.isLoading
                ? 'Loading roles...'
                : 'No roles match these filters.'
          }
        />
      </section>
    </div>
  )
}

export default RolesPage
