import { useState } from 'react'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCreateUser, useRoles } from '../../queries/users/users.queries'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  employeeId: '',
  roleIds: [],
  branchIds: [],
  warehouseIds: [],
  status: 'active',
}

function AddUserPage() {
  const navigate = useNavigate()
  const rolesQuery = useRoles()
  const createUser = useCreateUser()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const roles = rolesQuery.data?.data || []

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function updateIds(key, value) {
    update(key, value ? [value] : [])
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (!form.name.trim()) nextErrors.name = 'Enter a name.'
    if (!form.email.trim()) nextErrors.email = 'Enter an email.'
    else if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
    if (!form.password) nextErrors.password = 'Enter a password.'
    if (form.roleIds.length === 0) nextErrors.roleIds = 'Select a role.'
    if (form.employeeId.trim() && !/^[a-f\d]{24}$/i.test(form.employeeId.trim())) {
      nextErrors.employeeId = 'Enter a valid employee id, or leave it empty.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    createUser.mutate(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        employeeId: form.employeeId.trim() || null,
        roleIds: form.roleIds,
        branchIds: form.branchIds,
        warehouseIds: form.warehouseIds,
        status: form.status,
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || 'User created.')
          navigate('/users/users')
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
          toast.error(error.response?.data?.message || 'Could not save the user.')
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
          <Link to="/users/users" className="hover:text-slate-700">
            User
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Add User</span>
        </nav>
        <h1 className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-slate-900">Add User</h1>
        <p className="mt-2 text-sm text-slate-500">
          Create a sign-in account and assign the role, branches, and warehouses this person can use.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Account</h2>
        <p className="mt-0.5 text-xs text-slate-400">Name, sign-in details, and status</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Name"
            required
            value={form.name}
            error={errors.name}
            placeholder="e.g. Super Admin"
            onChange={(value) => update('name', value)}
          />
          <Field
            label="Email"
            required
            type="email"
            value={form.email}
            error={errors.email}
            placeholder="e.g. admin@gulzar.local"
            onChange={(value) => update('email', value)}
          />
          <Field
            label="Password"
            required
            type="password"
            value={form.password}
            error={errors.password}
            placeholder="Set a password"
            onChange={(value) => update('password', value)}
          />
          <Field
            label="Phone"
            value={form.phone}
            error={errors.phone}
            placeholder="e.g. +92 300 1234567"
            onChange={(value) => update('phone', value)}
          />
          <Field
            label="Employee"
            value={form.employeeId}
            error={errors.employeeId}
            placeholder="Leave empty if this user is not an employee"
            hint="Optional employee id. Saved as empty when not set."
            onChange={(value) => update('employeeId', value)}
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

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Access</h2>
        <p className="mt-0.5 text-xs text-slate-400">Role is required. Branches and warehouses are optional.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Role"
            required
            placeholder={rolesQuery.isLoading ? 'Loading roles...' : 'Select a role'}
            value={form.roleIds[0] || ''}
            error={errors.roleIds}
            options={roles.map((role) => ({ value: role._id, label: role.name }))}
            onChange={(value) => updateIds('roleIds', value)}
          />
          <SelectField
            label="Branch"
            placeholder="Select a branch"
            value={form.branchIds[0] || ''}
            error={errors.branchIds}
            options={[]}
            onChange={(value) => updateIds('branchIds', value)}
          />
          <SelectField
            label="Warehouse"
            placeholder="Select a warehouse"
            value={form.warehouseIds[0] || ''}
            error={errors.warehouseIds}
            options={[]}
            onChange={(value) => updateIds('warehouseIds', value)}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          <span className="text-rose-500">*</span> Required fields.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/users/users')}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createUser.isPending}
            className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createUser.isPending ? 'Saving' : 'Save User'}
          </button>
        </div>
      </div>
    </form>
  )
}

function Field({ label, required = false, value, error, hint, placeholder, type = 'text', onChange }) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'

  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <span className="relative mt-1.5 block">
        <input
          type={isPassword && visible ? 'text' : type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 ${
            isPassword ? 'pr-10' : ''
          } ${error ? 'border-rose-300' : 'border-slate-200'}`}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible((current) => !current)}
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </span>
      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </label>
  )
}

function SelectField({ label, required = false, value, error, placeholder, options, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <span className="relative mt-1.5 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-sky-400 ${
            error ? 'border-rose-300' : 'border-slate-200'
          } ${value ? 'text-slate-800' : 'text-slate-400'}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
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

export default AddUserPage
