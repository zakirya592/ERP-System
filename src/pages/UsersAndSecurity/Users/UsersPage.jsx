import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { Eye, Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { useUsers } from '../../../queries/users/users.queries.js'

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

const userColumns = [
  {
    key: 'name',
    label: 'NAME',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.name}</span>,
  },
  {
    key: 'email',
    label: 'EMAIL',
    renderCell: (item) => <span className="text-[13px] text-slate-500">{item.email || '—'}</span>,
  },
  {
    key: 'phone',
    label: 'PHONE',
    renderCell: (item) => <span className="text-[13px] text-slate-500">{item.phone || '—'}</span>,
  },
  {
    key: 'role',
    label: 'ROLE',
    renderCell: (item) => (
      <span className="text-[13px] text-slate-600">
        {item.roleIds?.map((role) => role.name).filter(Boolean).join(', ') || '—'}
      </span>
    ),
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
    key: 'lastLoginAt',
    label: 'LAST LOGIN',
    renderCell: (item) => <span className="text-[13px] text-slate-500">{formatWhen(item.lastLoginAt)}</span>,
  },
]

function UsersPage() {
  const navigate = useNavigate()
  const columns = [
    ...userColumns,
    {
      key: 'action',
      label: 'ACTION',
      renderCell: (item) => (
        <button
          type="button"
          aria-label={`View ${item.name}`}
          onClick={() => navigate(`/users/users/${item._id}`)}
          className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2563eb]"
        >
          <Eye size={16} />
        </button>
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

  const usersQuery = useUsers({ page, limit, search: debouncedSearch, status })
  const users = (usersQuery.data?.data || []).map((user) => ({ ...user, id: user._id }))
  const total = usersQuery.data?.meta?.total ?? users.length

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Users & Security</p>
          <h1 className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Users</h1>
          <p className="mt-2 text-sm text-slate-500">People who can sign in, and the roles assigned to them.</p>
        </div>
        <Button size="sm" onPress={() => navigate('/users/users/new')}>
          <Plus size={15} />
          Add User
        </Button>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">User list</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {total} {total === 1 ? 'user' : 'users'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email"
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
          ariaLabel="Users"
          columns={columns}
          data={users}
          pagination
          rowsPerPage={limit}
          page={page}
          totalCount={total}
          onPageChange={setPage}
          className="!h-auto !max-h-none"
          rowClassName="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
          emptyContent={
            usersQuery.isError
              ? usersQuery.error.response?.data?.message || 'Could not load users.'
              : usersQuery.isLoading
                ? 'Loading users...'
                : 'No users match these filters.'
          }
        />
      </section>
    </div>
  )
}

export default UsersPage
