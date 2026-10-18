import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

function permissionLabel(permissions) {
  const codes = (permissions || []).map((item) => item.code).filter(Boolean)
  if (!codes.length) return '—'
  const shown = codes.slice(0, 3).join(', ')
  return codes.length > 3 ? `${shown} +${codes.length - 3}` : shown
}

const columns = [
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
    renderCell: (item) => <span className="text-[13px] text-slate-600">{permissionLabel(item.permissionIds)}</span>,
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
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Users & Security</p>
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
          className="!h-auto !max-h-none"
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
