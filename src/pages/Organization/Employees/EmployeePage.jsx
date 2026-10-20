import { useState } from 'react'
import { Download, Plus, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { employeeAccess, employeeSummary, mergeEmployeeRegister, useAddedEmployees, useEmployeeOverrides } from './employeeRecords.js'

const pageSize = 5

const tabs = ['Branches',  'Shops', 'Warehouses','Employees', 'Owners', 'Partnerships']

const tabRoutes = {
  Shops: '/organization/shop',
  Warehouses: '/organization/warehouses',
  Branches: '/organization/branches',
}

export const employees = [
  {
    id: 'EMP-001',
    code: 'EMP-001',
    name: 'Omar Khalid',
    email: 'omar@example.com',
    phone: '',
    department: 'Operations',
    jobTitle: 'Branch Manager',
    employmentType: 'Full-time',
    joiningDate: 'Jan 01, 2026',
    reportsTo: 'Amina Rahman',
    status: 'Active',
    branch: 'Central Branch',
    shop: 'Central Shop',
    warehouse: 'Main Warehouse',
    erpRole: 'Branch Manager',
    createLogin: 'Enabled',
    loginStatus: 'Enabled pending',
    documentType: 'Employment contract / ID',
    documentReference: 'DOC-EMP-001',
    fileName: 'agreement-or-record.pdf',
    notes: '',
    createdBy: 'Amina Rahman',
    createdOn: 'Jan 01, 2026',
    updatedOn: 'Sep 20, 2026',
    summary: employeeSummary,
    access: employeeAccess,
    assignments: [
      { id: 'EMP-001-branch', location: 'Central Branch', type: 'Branch', scope: 'Primary', accessRole: 'Branch Manager', status: 'Active' },
      { id: 'EMP-001-shop', location: 'Central Shop', type: 'Shop', scope: 'Sales', accessRole: 'Sales + reports', status: 'Active' },
      { id: 'EMP-001-warehouse', location: 'Main Warehouse', type: 'Warehouse', scope: 'Stock', accessRole: 'Read only', status: 'Active' },
    ],
  },
  {
    id: 'EMP-002',
    code: 'EMP-002',
    name: 'Nadia Sattar',
    email: 'nadia@example.com',
    phone: '',
    department: 'Management',
    jobTitle: 'Area Manager',
    employmentType: 'Full-time',
    joiningDate: 'Feb 12, 2026',
    reportsTo: 'Amina Rahman',
    status: 'Active',
    branch: 'North Branch',
    shop: 'North Shop',
    warehouse: '',
    erpRole: 'Shop Manager',
    createLogin: 'Enabled',
    loginStatus: 'Enabled',
    documentType: 'Employment contract / ID',
    documentReference: 'DOC-EMP-002',
    fileName: '',
    notes: '',
    createdBy: 'Amina Rahman',
    createdOn: 'Feb 12, 2026',
    updatedOn: 'Sep 18, 2026',
    summary: employeeSummary,
    access: employeeAccess,
    assignments: [
      { id: 'EMP-002-branch', location: 'North Branch', type: 'Branch', scope: 'Primary', accessRole: 'Area Manager', status: 'Active' },
    ],
  },
  {
    id: 'EMP-003',
    code: 'EMP-003',
    name: 'Bilal Ahmed',
    email: 'bilal@example.com',
    phone: '',
    department: 'Warehouse',
    jobTitle: 'Store Keeper',
    employmentType: 'Full-time',
    joiningDate: 'Mar 04, 2026',
    reportsTo: 'Omar Khalid',
    status: 'Active',
    branch: 'Central Branch',
    shop: '',
    warehouse: 'Main Warehouse',
    erpRole: 'Store Keeper',
    createLogin: 'Disabled',
    loginStatus: 'Disabled',
    documentType: 'Employment contract / ID',
    documentReference: 'DOC-EMP-003',
    fileName: '',
    notes: '',
    createdBy: 'Amina Rahman',
    createdOn: 'Mar 04, 2026',
    updatedOn: 'Aug 30, 2026',
    summary: employeeSummary,
    access: employeeAccess,
    assignments: [
      { id: 'EMP-003-warehouse', location: 'Main Warehouse', type: 'Warehouse', scope: 'Stock', accessRole: 'Store Keeper', status: 'Active' },
    ],
  },
  {
    id: 'EMP-004',
    code: 'EMP-004',
    name: 'Sara Khan',
    email: 'sara@example.com',
    phone: '',
    department: 'Sales',
    jobTitle: 'Sales Officer',
    employmentType: 'Full-time',
    joiningDate: 'Apr 16, 2026',
    reportsTo: 'Omar Khalid',
    status: 'Active',
    branch: 'Central Branch',
    shop: 'Central Shop',
    warehouse: '',
    erpRole: 'Sales Officer',
    createLogin: 'Enabled',
    loginStatus: 'Enabled pending',
    documentType: 'Employment contract / ID',
    documentReference: 'DOC-EMP-004',
    fileName: '',
    notes: '',
    createdBy: 'Amina Rahman',
    createdOn: 'Apr 16, 2026',
    updatedOn: 'Sep 02, 2026',
    summary: employeeSummary,
    access: employeeAccess,
    assignments: [
      { id: 'EMP-004-shop', location: 'Central Shop', type: 'Shop', scope: 'Sales', accessRole: 'Sales + reports', status: 'Active' },
    ],
  },
  {
    id: 'EMP-005',
    code: 'EMP-005',
    name: 'Lina Abbas',
    email: 'lina@example.com',
    phone: '',
    department: 'Operations',
    jobTitle: 'Operations Officer',
    employmentType: 'Full-time',
    joiningDate: 'May 21, 2026',
    reportsTo: 'Omar Khalid',
    status: 'On leave',
    branch: 'Airport Branch',
    shop: '',
    warehouse: '',
    erpRole: '',
    createLogin: 'Enabled',
    loginStatus: 'Enabled pending',
    documentType: 'Employment contract / ID',
    documentReference: 'DOC-EMP-005',
    fileName: '',
    notes: '',
    createdBy: 'Amina Rahman',
    createdOn: 'May 21, 2026',
    updatedOn: 'Sep 11, 2026',
    summary: employeeSummary,
    access: employeeAccess,
    assignments: [],
  },
]

const statusClass = {
  Active: 'bg-[#e7f8ee] text-[#1f9d57]',
  'On leave': 'bg-[#eef1f4] text-[#6b7280]',
  Inactive: 'bg-[#eef1f4] text-[#8b95a5]',
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClass[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  )
}

function employeeColumns(onView, onEdit) {
  return [
    {
      key: 'code',
      label: 'CODE',
      renderCell: (item) => <span className="font-mono text-[12px] text-slate-400">{item.code}</span>,
    },
    {
      key: 'name',
      label: 'EMPLOYEE',
      isRowHeader: true,
      renderCell: (item) => (
        <button type="button" onClick={() => onView(item)} className="text-[13px] font-medium text-slate-800">
          {item.name}
        </button>
      ),
    },
    {
      key: 'department',
      label: 'DEPARTMENT',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{item.department}</span>,
    },
    {
      key: 'branch',
      label: 'PRIMARY BRANCH',
      renderCell: (item) => <span className="text-[13px] text-slate-600">{item.branch}</span>,
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
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => onView(item)} className="text-[13px] font-medium text-[#2f6fed]">
            View
          </button>
          <button type="button" onClick={() => onEdit(item)} className="text-[13px] font-medium text-[#2f6fed]">
            Edit
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
    renderCell: (item) => <span className="text-[13px] font-medium text-slate-800">{item.location}</span>,
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
  const addedEmployees = useAddedEmployees()
  const overrides = useEmployeeOverrides()
  const register = mergeEmployeeRegister(addedEmployees, employees, overrides)
  const [tab, setTab] = useState('Employees')
  const [query, setQuery] = useState('')
  const [branch, setBranch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || employees[0].id)
  const [assignmentId, setAssignmentId] = useState(employees[0].assignments[0].id)

  const branches = [...new Set(register.map((employee) => employee.branch).filter(Boolean))]
  const needle = query.trim().toLowerCase()
  const filtered = register.filter((employee) => {
    const matchesQuery =
      !needle || employee.name.toLowerCase().includes(needle) || employee.code.toLowerCase().includes(needle)
    const matchesBranch = !branch || employee.branch === branch
    const matchesStatus = !status || employee.status === status
    return matchesQuery && matchesBranch && matchesStatus
  })
  const start = (page - 1) * pageSize
  const pageRows = filtered.slice(start, start + pageSize)
  const selected = pageRows.find((employee) => employee.id === selectedId) || pageRows[0] || null
  const assignments = selected?.assignments || []
  const selectedAssignment = assignments.find((item) => item.id === assignmentId) || assignments[0] || null
  const departmentCount = new Set(register.map((employee) => employee.department).filter(Boolean)).size
  const assignmentCount = register.reduce((total, employee) => total + (employee.assignments?.length || 0), 0)
  const pendingCount = register.filter((employee) => String(employee.loginStatus || '').toLowerCase().includes('pending')).length

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
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            <Download size={15} />
            Export
          </button>
          <button
            type="button"
            onClick={() => navigate('/organization/employees/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
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
        <Stat label="Employees" value={register.length} />
        <Stat label="Departments" value={departmentCount} />
        <Stat label="Assignments" value={assignmentCount} />
        <Stat label="Pending access" value={pendingCount} />
      </section>

      {tab === 'Employees' ? (
        <>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Search name or code"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400"
              />
            </label>
            <select
              aria-label="Status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
                setPage(1)
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="On leave">On leave</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              aria-label="Branch"
              value={branch}
              onChange={(event) => {
                setBranch(event.target.value)
                setPage(1)
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              <option value="">All branches</option>
              {branches.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button type="button" onClick={clearFilters} className="px-2 py-2 text-sm font-medium text-[#2f6fed] lg:ml-auto">
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
                  rowsPerPage={pageSize}
                  page={page}
                  totalCount={filtered.length}
                  onPageChange={setPage}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent="No employees match these filters."
                  summary={
                    filtered.length
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
                  rowsPerPage={pageSize}
                  className="h-auto! max-h-none!"
                  contentClassName="min-w-full"
                  emptyContent={selected ? 'This employee has no location assignments.' : 'Select an employee to see location assignments.'}
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

            {selected ? <EmployeeDetail employee={selected} /> : null}
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

function EmployeeDetail({ employee }) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-4">
      <h2 className="text-[18px] font-semibold text-slate-900">{employee.name}</h2>
      <p className="mt-1 text-[13px] text-slate-400">{employee.code}</p>
      <div className="mt-3">
        <StatusPill status={employee.status} />
      </div>
      <p className="mt-4 text-[13px] leading-5 text-slate-500">{employee.summary}</p>
      <dl className="mt-5 space-y-3.5">
        <Fact label="Created by" value={employee.createdBy} />
        <Fact label="Created on" value={employee.createdOn} />
        <Fact label="Updated" value={employee.updatedOn} />
        <Fact label="Record status" value={employee.status} />
      </dl>
      <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
        <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">{employee.access}</p>
      </div>
    </aside>
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
