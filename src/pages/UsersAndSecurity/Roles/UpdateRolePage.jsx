import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, Minus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { usePermissions } from '../../../queries/permissions/permissions.queries'
import { useRole, useUpdateRole } from '../../../queries/roles/roles.queries'

const actionOrder = ['create', 'read', 'update', 'delete', 'approve', 'post', 'all']

const emptyForm = {
  name: '',
  code: '',
  permissionIds: [],
  status: 'active',
}

function titleCase(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function permissionId(item) {
  return typeof item === 'string' ? item : item?._id
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
      modules.push({ key: moduleKey, label: titleCase(moduleKey), cells: {} })
    }

    modules[moduleIndex.get(moduleKey)].cells[actionKey] = permission
  })

  const columns = [
    ...actionOrder.filter((action) => actions.has(action)),
    ...[...actions].filter((action) => !actionOrder.includes(action)).sort(),
  ]

  return { modules, columns }
}

function UpdateRolePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const roleQuery = useRole(id)
  const permissionsQuery = usePermissions({ page: 1, limit: 100, search: '' })
  const updateRole = useUpdateRole()
  const role = roleQuery.data?.data
  const [form, setForm] = useState(emptyForm)
  const [ready, setReady] = useState(false)
  const [errors, setErrors] = useState({})
  const permissions = permissionsQuery.data?.data || []
  const { modules, columns } = useMemo(() => buildMatrix(permissions), [permissions])
  const selected = new Set(form.permissionIds)

  useEffect(() => {
    if (!role || ready) return
    setForm({
      name: role.name || '',
      code: role.code || '',
      permissionIds: (role.permissionIds || []).map(permissionId).filter(Boolean),
      status: role.status || 'active',
    })
    setReady(true)
  }, [role, ready])

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function togglePermission(permission) {
    setForm((current) => {
      const next = new Set(current.permissionIds)
      if (next.has(permission)) next.delete(permission)
      else next.add(permission)
      return { ...current, permissionIds: [...next] }
    })
    setErrors((current) => ({ ...current, permissionIds: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    const name = form.name.trim()
    const code = form.code.trim()

    if (!name) nextErrors.name = 'Enter a name.'
    if (!code) nextErrors.code = 'Enter a code.'
    else if (!/^[a-z0-9_]+$/.test(code)) nextErrors.code = 'Use lowercase letters, numbers, and underscores.'
    if (form.permissionIds.length === 0) nextErrors.permissionIds = 'Select at least one permission.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    updateRole.mutate(
      {
        id,
        name,
        code,
        permissionIds: form.permissionIds,
        status: form.status,
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || 'Role updated.')
          navigate('/users/roles')
        },
        onError: (error) => {
          const apiErrors = error.response?.data?.errors
          if (Array.isArray(apiErrors)) {
            const fieldErrors = {}
            apiErrors.forEach((item) => {
              if (item.field && !fieldErrors[item.field]) fieldErrors[item.field] = item.message
            })
            setErrors((current) => ({ ...current, ...fieldErrors }))
          }
          toast.error(error.response?.data?.message || 'Could not update the role.')
        },
      },
    )
  }

  return (
    <form className="mx-auto max-w-5xl space-y-4" onSubmit={handleSubmit}>
      <div>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link to="/dashboard" className="hover:text-slate-700">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/users/roles" className="hover:text-slate-700">
            Roles
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Update Role</span>
        </nav>
        <h1 className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-slate-900">Update Role</h1>
        <p className="mt-2 text-sm text-slate-500">Change the name, status, and permissions for this role.</p>
      </div>

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

      {ready && (
        <>
          <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Role</h2>
            <p className="mt-0.5 text-xs text-slate-400">Name, code, and status</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field
                label="Name"
                required
                value={form.name}
                error={errors.name}
                placeholder="e.g. Sales Manager"
                onChange={(value) => update('name', value)}
              />
              <Field
                label="Code"
                required
                value={form.code}
                error={errors.code}
                placeholder="e.g. sales_manager"
                hint="Lowercase letters, numbers, and underscores."
                onChange={(value) => update('code', value)}
              />
              <SelectField
                label="Status"
                required
                value={form.status}
                error={errors.status}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                onChange={(value) => update('status', value)}
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-[15px] font-semibold text-slate-900">Permissions matrix</h2>
              <p className="mt-0.5 text-sm text-slate-400">
                {form.permissionIds.length} selected
                {form.name.trim() ? ` for ${form.name.trim()}` : ''}
              </p>
              {errors.permissionIds && <p className="mt-1 text-xs text-rose-500">{errors.permissionIds}</p>}
            </div>

            {modules.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-400">
                {permissionsQuery.isError
                  ? permissionsQuery.error.response?.data?.message || 'Could not load permissions.'
                  : permissionsQuery.isLoading
                    ? 'Loading permissions...'
                    : 'No permissions to assign.'}
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
                        {columns.map((action) => {
                          const permission = module.cells[action]
                          const granted = permission ? selected.has(permission._id) : false
                          return (
                            <td key={action} className="px-3 py-3.5 text-center">
                              {permission ? (
                                <button
                                  type="button"
                                  aria-pressed={granted}
                                  aria-label={`${granted ? 'Remove' : 'Add'} ${permission.code}`}
                                  onClick={() => togglePermission(permission._id)}
                                  className="inline-flex cursor-pointer"
                                >
                                  <Mark granted={granted} />
                                </button>
                              ) : (
                                <Mark granted={false} />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              <span className="text-rose-500">*</span> Required fields.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(`/users/roles/${id}`)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateRole.isPending}
                className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateRole.isPending ? 'Saving' : 'Save Role'}
              </button>
            </div>
          </div>
        </>
      )}
    </form>
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

function Field({ label, required = false, value, error, hint, placeholder, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 ${
          error ? 'border-rose-300' : 'border-slate-200'
        }`}
      />
      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </label>
  )
}

function SelectField({ label, required = false, value, error, options, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <span className="relative mt-1.5 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-slate-800 outline-none focus:border-sky-400 ${
            error ? 'border-rose-300' : 'border-slate-200'
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
      </span>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

export default UpdateRolePage
