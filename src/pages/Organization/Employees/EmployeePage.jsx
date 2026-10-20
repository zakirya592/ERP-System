import { useEffect, useState } from 'react'
import { Download, Eye, Pencil, Plus, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { useBranches } from '../../../queries/branches/branches.queries.js'
import { useEmployee, useEmployees, useUpdateEmployeeStatus } from '../../../queries/employees/employees.queries.js'
import { display, employeeAccess, employeeSummary, employmentStatuses, mapEmployee, statusClassName } from './employeeRecords.js'

const limit = 20

const tabs = ['Branches', 'Shops', 'Warehouses', 'Employees', 'Owners', 'Partnerships']

const tabRoutes = {
  Shops: '/organization/shop',
  Warehouses: '/organization/warehouses',
  Branches: '/organization/branches',
  Owners: '/organization/owners',
}

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'On leave', value: 'on_leave' },
  { label: 'Inactive', value: 'inactive' },
]

function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(status)}`}>
      {status}
    </span>
  )
}

function employeeColumns(onView, onEdit) {
  return [
    {
      key: 'code',
      label: 'CODE',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{display(item.code)}</span>,
    },
    {
      key: 'name',
      label: 'EMPLOYEE',
      isRowHeader: true,
      renderCell: (item) => (
        <button type="button" onClick={() => onView(item)} className="text-[13px] font-medium text-slate-800">
          {display(item.name)}
        </button>
      ),
    },
    {
      key: 'department',
      label: 'DEPARTMENT',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.department)}</span>,
    },
    {
      key: 'branch',
      label: 'PRIMARY BRANCH',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{display(item.branch)}</span>,
    },
    {
      key: 'status',
      label: 'STATUS',
      renderCell: (item) => <StatusPill status={item.status} />,
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      className: 'text-right',
      cellClassName: 'text-right',
      renderCell: (item) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            aria-label={`View ${item.name}`}
            onClick={() => onView(item)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            aria-label={`Update ${item.name}`}
            onClick={() => onEdit(item)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#2563eb]"
          >
            <Pencil size={16} />
          </button>
        </div>
      ),
    },
  ]
}

const assignmentColumns = [
  {
    key: 'location',
    label: 'LOCATION',
    isRowHeader: true,
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{display(item.location)}</span>,
  },
  {
    key: 'type',
    label: 'TYPE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.type}</span>,
  },
  {
    key: 'scope',
    label: 'SCOPE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.scope}</span>,
  },
  {
    key: 'accessRole',
    label: 'ACCESS ROLE',
    renderCell: (item) => <span className="text-[13px] text-slate-600">{item.accessRole}</span>,
  },
  {
    key: 'status',
    label: 'STATUS',
    renderCell: (item) => <StatusPill status={item.status} />,
  },
]

function EmployeePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState('Employees')
  const [query, setQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [branch, setBranch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || null)
  const [assignmentId, setAssignmentId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, branch])

  const branchFilterActive = Boolean(branch)
  const employeesQuery = useEmployees({
    page: branchFilterActive ? 1 : page,
    limit: branchFilterActive ? 100 : limit,
    search: debouncedSearch,
    status,
  })
  const updateStatus = useUpdateEmployeeStatus()
  const branchesQuery = useBranches({ page: 1, limit: 100, search: '', status: '' })
  const mapped = (employeesQuery.data?.data || []).map(mapEmployee)
  const filtered = branch ? mapped.filter((employee) => employee.branchId === branch) : mapped
  const total = branch ? filtered.length : (employeesQuery.data?.meta?.total ?? mapped.length)
  const pageRows = branch ? filtered.slice((page - 1) * limit, page * limit) : mapped
  const summary = employeesQuery.data?.meta?.summary || employeesQuery.data?.data?.[0]?.summary
  const selected = pageRows.find((employee) => employee.id === selectedId) || pageRows[0] || null

  useEffect(() => {
    if (selectedId && pageRows.some((employee) => employee.id === selectedId)) return
    if (pageRows[0]) setSelectedId(pageRows[0].id)
  }, [pageRows, selectedId])

  const detailQuery = useEmployee(selected?.id)
  const detail = detailQuery.data?.data ? mapEmployee(detailQuery.data.data) : null
  const profile = detail || selected
  const assignments = detail?.assignments || []
  const selectedAssignment = assignments.find((item) => item.id === assignmentId) || assignments[0] || null
  const branchOptions = (branchesQuery.data?.data || []).map((item) => ({
    id: item._id,
    name: item.name,
  }))
  const employeeTotal = summary?.employees?.total ?? employeesQuery.data?.meta?.total ?? 0
  const departmentCount = summary?.departments ?? '—'
  const activeCount = summary?.employees?.active ?? '—'
  const pendingCount = summary?.pendingAccess ?? '—'

  function openTab(item) {
    const route = tabRoutes[item]
    if (route) {
      navigate(route)
      return
    }
    setTab(item)
  }

  function selectEmployee(employee) {
    setSelectedId(employee.id)
    setAssignmentId(employee.assignments[0]?.id || null)
  }

  function viewEmployee(employee) {
    navigate(`/organization/employees/${employee.id}`)
  }

  function editEmployee(employee) {
    navigate(`/organization/employees/${employee.id}/edit`)
  }

  function changeStatus(nextStatus) {
    if (!profile?.id || profile.statusValue === nextStatus || updateStatus.isPending) return
    updateStatus.mutate(
      { id: profile.id, status: nextStatus },
      {
        onSuccess: (data) => {
          const label = employmentStatuses.find((option) => option.value === nextStatus)?.label || nextStatus
          toast.success(data?.message || `${profile.name || 'Employee'} is now ${label}.`)
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Could not update the employment status.')
        },
      },
    )
  }

  function clearFilters() {
    setQuery('')
    setBranch('')
    setStatus('')
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <Link to="/dashboard" className="hover:text-slate-700">
              Organization
            </Link>
            <span>/</span>
            <span className="text-slate-700">Employees</span>
            <span>/</span>
            <span>Register</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Employees</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage employee profiles, reporting lines, workplace assignments and ERP access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toast.success('Employee register exported.')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 cursor-pointer"
          >
            <Download size={15} />
            Export
          </button>
          <button
            type="button"
            onClick={() => navigate('/organization/employees/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white cursor-pointer"
          >
            <Plus size={15} />
            Add Employee
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => openTab(item)}
            className={
              tab === item
                ? 'rounded-lg bg-[#e8f1ff] px-3 py-1.5 text-sm font-medium text-[#2f6fed]'
                : 'rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-white'
            }
          >
            {item}
          </button>
        ))}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Employees" value={employeeTotal} />
        <Stat label="Departments" value={departmentCount} />
        <Stat label="Active" value={activeCount} />
        <Stat label="Pending access" value={pendingCount} />
      </section>

      {tab === 'Employees' ? (
        <>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or code"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
              />
            </label>
            <select
              aria-label="Status"
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
            <select
              aria-label="Branch"
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              <option value="">All branches</option>
              {branchOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={clearFilters} className="cursor-pointer px-2 py-2 text-sm font-medium text-[#2f6fed] lg:ml-auto">
              Clear filters
            </button>
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="px-5 pt-4">
                  <h2 className="text-sm font-semibold text-slate-900">Employees register</h2>
                </div>
                <GlobalTable
                  ariaLabel="Employees register"
                  columns={employeeColumns(viewEmployee, editEmployee)}
                  data={pageRows}
                  pagination
                  rowsPerPage={limit}
                  page={page}
                  totalCount={total}
                  onPageChange={setPage}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent={
                    employeesQuery.isError
                      ? employeesQuery.error.response?.data?.message || 'Could not load employees.'
                      : employeesQuery.isLoading
                        ? 'Loading employees...'
                        : 'No employees match these filters.'
                  }
                  summary={
                    total
                      ? `Showing ${pageRows.length} ${pageRows.length === 1 ? 'record' : 'records'}${selected ? ' · 1 selected' : ''}`
                      : undefined
                  }
                  onRowPress={selectEmployee}
                  rowClassName={(employee) => (selected?.id === employee.id ? 'row-soft' : 'hover:bg-slate-50')}
                />
              </section>

              <section className="rounded-2xl border border-[#d7e6ff] bg-[#eef4ff] px-5 py-4">
                <h2 className="text-sm font-semibold text-[#2f6fed]">Organization note</h2>
                <p className="mt-1 text-[13px] leading-5 text-slate-500">{employeeSummary}</p>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="px-5 pt-4">
                  <h2 className="text-sm font-semibold text-slate-900">Location assignments</h2>
                </div>
                <GlobalTable
                  ariaLabel="Location assignments"
                  columns={assignmentColumns}
                  data={assignments}
                  pagination
                  rowsPerPage={limit}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent={
                    !selected
                      ? 'Select an employee to see location assignments.'
                      : detailQuery.isLoading
                        ? 'Loading assignments...'
                        : detailQuery.isError
                          ? detailQuery.error.response?.data?.message || 'Could not load assignments.'
                          : 'This employee has no location assignments.'
                  }
                  summary={
                    assignments.length
                      ? `Showing ${assignments.length} ${assignments.length === 1 ? 'record' : 'records'}${selectedAssignment ? ' · 1 selected' : ''}`
                      : undefined
                  }
                  onRowPress={(assignment) => setAssignmentId(assignment.id)}
                  rowClassName={(assignment) => (selectedAssignment?.id === assignment.id ? 'row-soft' : 'hover:bg-slate-50')}
                />
              </section>
            </div>

            {profile ? (
              <EmployeeDetail
                employee={profile}
                statusPending={updateStatus.isPending}
                onStatusChange={changeStatus}
              />
            ) : null}
          </div>
        </>
      ) : (
        <Directory tab={tab} />
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

function EmployeeDetail({ employee, statusPending, onStatusChange }) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-4">
      <h2 className="text-[18px] font-semibold text-slate-900">{display(employee.name)}</h2>
      <p className="mt-1 text-[13px] text-slate-400">{display(employee.code)}</p>
      <div className="mt-3">
        <StatusPill status={employee.status} />
      </div>
      <StatusSwitcher value={employee.statusValue} pending={statusPending} onChange={onStatusChange} />
      <p className="mt-4 text-[13px] leading-5 text-slate-500">
        {employee.jobTitle ? `${employee.jobTitle}${employee.department ? ` in ${employee.department}` : ''}.` : employeeAccess}
      </p>
      <dl className="mt-5 space-y-3.5">
        <Fact label="Reports to" value={display(employee.reportsTo)} />
        <Fact label="Created on" value={employee.createdOn} />
        <Fact label="Updated" value={employee.updatedOn} />
      </dl>
      <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
        <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">
          {employee.loginStatus ? `Login: ${employee.loginStatus}. ` : ''}
          {employeeAccess}
        </p>
      </div>
    </aside>
  )
}

function StatusSwitcher({ value, pending, onChange }) {
  return (
    <div className="mt-4">
      <p className="text-[12px] font-medium text-slate-400">Employment status</p>
      <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {employmentStatuses.map((option) => {
          const selected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              disabled={pending}
              onClick={() => onChange(option.value)}
              className={`cursor-pointer rounded-lg px-1 py-1.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
                selected ? `${statusClassName(option.label)} shadow-sm` : 'text-slate-500 hover:bg-white'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-[13px] text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-[14px] font-medium text-slate-800">{value}</dd>
    </div>
  )
}

function Directory({ tab }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{tab}</h2>
      <p className="mt-1 text-sm text-slate-400">Nothing is configured in this view yet.</p>
    </section>
  )
}

export default EmployeePage
