import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GlobalTable from '../../../components/GlobalTable.jsx'
import { mergeEmployeeRegister, useAddedEmployees, useEmployeeOverrides } from './employeeRecords.js'
import { employees as seedEmployees } from './EmployeePage.jsx'

const statusClass = {
  Active: 'bg-[#e7f8ee] text-[#1f9d57]',
  'On leave': 'bg-[#eef1f4] text-[#6b7280]',
  Inactive: 'bg-[#eef1f4] text-[#8b95a5]',
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

function display(value, empty = '—') {
  const text = String(value ?? '').trim()
  return text || empty
}

function ViewEmployeePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addedEmployees = useAddedEmployees()
  const overrides = useEmployeeOverrides()
  const register = mergeEmployeeRegister(addedEmployees, seedEmployees, overrides)
  const employee = register.find((item) => item.id === id || item.code === id) || null
  const [assignmentId, setAssignmentId] = useState(employee?.assignments?.[0]?.id || null)

  const assignments = employee?.assignments || []
  const selectedAssignment = assignments.find((item) => item.id === assignmentId) || assignments[0] || null
  const departmentCount = new Set(register.map((item) => item.department).filter(Boolean)).size
  const assignmentCount = register.reduce((total, item) => total + (item.assignments?.length || 0), 0)
  const pendingCount = register.filter((item) => String(item.loginStatus || '').toLowerCase().includes('pending')).length

  if (!employee) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Employee not found</h1>
        <Link to="/organization/employees" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Employees
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <span>Organization</span>
            <span>/</span>
            <Link to="/organization/employees" className="hover:text-slate-700">
              Employees
            </Link>
            <span>/</span>
            <span className="text-slate-700">Detail</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">{employee.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage employee profiles, reporting lines, workplace assignments and ERP access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/organization/employees"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Back to Employees
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/organization/employees/${employee.id}/edit`)}
            className="rounded-lg bg-[#2f6fed] px-3.5 py-2 text-sm font-medium text-white"
          >
            Edit Employee
          </button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Employees" value={register.length} />
        <Stat label="Departments" value={departmentCount} />
        <Stat label="Assignments" value={assignmentCount} />
        <Stat label="Pending access" value={pendingCount} />
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Employee information</h2>
            <p className="mt-0.5 text-sm text-slate-400">Profile, assignment and operating details</p>

            <DetailSection title="Personal and contact information">
              <Fact label="Full name" value={employee.name} />
              <Fact label="Employee code" value={employee.code} />
              <Fact label="Work email" value={display(employee.email)} />
              <Fact label="Phone" value={display(employee.phone, 'Enter contact phone')} muted={!employee.phone} />
            </DetailSection>

            <DetailSection title="Employment and reporting" columns="xl:grid-cols-3">
              <Fact label="Department" value={display(employee.department)} />
              <Fact label="Job title" value={display(employee.jobTitle)} />
              <Fact label="Employment type" value={display(employee.employmentType)} />
              <Fact label="Joining date" value={display(employee.joiningDate)} />
              <Fact label="Reports to" value={display(employee.reportsTo)} />
              <Fact label="Employment status" value={employee.status} />
            </DetailSection>

            <DetailSection title="Workspace assignment and access" columns="xl:grid-cols-3">
              <Fact label="Primary branch" value={display(employee.branch)} />
              <Fact label="Shop assignment" value={display(employee.shop)} />
              <Fact label="Warehouse access" value={display(employee.warehouse)} />
              <Fact label="ERP role" value={display(employee.erpRole)} />
              <Fact label="Create login" value={display(employee.createLogin)} />
              <Fact label="Login status" value={display(employee.loginStatus)} />
            </DetailSection>
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
              rowsPerPage={5}
              className="h-auto! max-h-none!"
              contentClassName="min-w-full"
              emptyContent="This employee has no location assignments."
              summary={
                assignments.length
                  ? `Showing ${assignments.length} ${assignments.length === 1 ? 'record' : 'records'}${selectedAssignment ? ' · 1 selected' : ''}`
                  : undefined
              }
              onRowPress={(assignment) => setAssignmentId(assignment.id)}
              rowClassName={(assignment) => (selectedAssignment?.id === assignment.id ? 'row-soft' : 'hover:bg-slate-50')}
            />
          </section>

          <button
            type="button"
            onClick={() => navigate(`/organization/employees/${employee.id}/edit`)}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
          >
            Edit assignments
          </button>
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900">{employee.name}</h2>
          <p className="mt-1 text-[13px] text-slate-400">{employee.code}</p>
          <div className="mt-3">
            <StatusPill status={employee.status} />
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{employee.summary}</p>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Created by" value={display(employee.createdBy)} />
            <SideFact label="Created on" value={display(employee.createdOn)} />
            <SideFact label="Updated" value={display(employee.updatedOn)} />
            <SideFact label="Record status" value={employee.status} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{employee.access}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClass[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
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
      <p className={`mt-1 text-[14px] font-medium ${muted ? 'text-slate-400' : 'text-slate-800'}`}>{value}</p>
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

export default ViewEmployeePage
