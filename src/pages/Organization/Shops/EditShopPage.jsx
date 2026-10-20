import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useBranch, useBranches } from '../../../queries/branches/branches.queries.js'
import { useShop, useUpdateShop } from '../../../queries/shops/shops.queries.js'
import {
  applyApiErrors,
  branchNameOf,
  formFromShop,
  priceLists,
  shopAccess,
  shopRule,
  shopStatuses,
  shopTypes,
  statusClassName,
  toShopBody,
  warehouseNameOf,
  warehouseOptions,
  withOption,
} from './shopRecords.js'

function EditShopPage() {
  const { id } = useParams()
  const shopQuery = useShop(id)
  const shop = shopQuery.data?.data

  if (shopQuery.isLoading) {
    return <Message>Loading shop...</Message>
  }

  if (shopQuery.isError) {
    return <Message className="text-rose-500">{shopQuery.error.response?.data?.message || 'Could not load this shop.'}</Message>
  }

  if (!shop) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">Shop not found</h1>
        <Link to="/organization/shop" className="mt-3 inline-flex text-sm font-medium text-[#2f6fed]">
          Back to Shops
        </Link>
      </section>
    )
  }

  return <EditShopForm key={shop._id} shop={shop} />
}

function EditShopForm({ shop }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const updateShop = useUpdateShop()
  const branchesQuery = useBranches({ page: 1, limit: 50, search: '', status: '' })
  const [form, setForm] = useState(() => formFromShop(shop))
  const [errors, setErrors] = useState({})
  const branchQuery = useBranch(form.branchId)

  const branchOptions = withOption(
    (branchesQuery.data?.data || []).map((branch) => ({
      value: branch._id,
      label: branch.name,
    })),
    form.branchId,
    branchNameOf(shop),
  )
  const linkedWarehouses = withOption(
    warehouseOptions(branchQuery.data?.data, shop),
    form.warehouseId,
    warehouseNameOf(shop),
  )

  function update(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'branchId') next.warehouseId = ''
      return next
    })
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Enter a shop name.'
    if (!form.code.trim()) nextErrors.code = 'Enter a shop code.'
    if (!form.branchId) nextErrors.branchId = 'Select a parent branch.'
    if (!form.address.trim()) nextErrors.address = 'Enter an address.'
    if (form.email.trim() && !form.email.includes('@')) nextErrors.email = 'Enter a valid email.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function save(event) {
    event.preventDefault()
    if (!validate() || updateShop.isPending) return
    updateShop.mutate(
      { id, ...toShopBody(form) },
      {
        onSuccess: (data) => {
          toast.success(data?.message || `${form.name.trim()} updated.`)
          navigate(`/organization/shop/${id}`)
        },
        onError: (error) => {
          applyApiErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not update the shop.')
        },
      },
    )
  }

  const statusLabel = shopStatuses.find((option) => option.value === form.status)?.label || form.status || 'Active'

  return (
    <form className="space-y-4" onSubmit={save}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            <span>Organization</span>
            <span>/</span>
            <Link to="/organization/shop" className="hover:text-slate-700">
              Shops
            </Link>
            <span>/</span>
            <span className="text-slate-700">Update</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">Edit Shop</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage retail locations, branch links, sales teams and shop defaults.
          </p>
        </div>
        <Link to="/organization/shop" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700">
          Back to Shops
        </Link>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <FormCard title="Shop information">
            <Field label="Shop name" required value={form.name} error={errors.name} placeholder="Enter shop name" onChange={(value) => update('name', value)} />
            <Field label="Shop code" required value={form.code} error={errors.code} placeholder="Enter shop code" onChange={(value) => update('code', value)} />
            <SelectField
              label="Parent branch"
              required
              value={form.branchId}
              error={errors.branchId}
              placeholder="Select parent branch"
              options={branchOptions}
              onChange={(value) => update('branchId', value)}
            />
            <SelectField
              label="Shop type"
              value={form.shopType}
              error={errors.shopType}
              placeholder="Select shop type"
              options={withOption(shopTypes, form.shopType, shop.shopTypeLabel)}
              onChange={(value) => update('shopType', value)}
            />
          </FormCard>

          <FormCard title="Location and contact">
            <Field label="Address" required value={form.address} error={errors.address} placeholder="Enter address" onChange={(value) => update('address', value)} />
            <Field label="City / district" value={form.location} error={errors.location} placeholder="Enter city / district" onChange={(value) => update('location', value)} />
            <Field label="Phone" value={form.phone} error={errors.phone} placeholder="Enter shop phone" onChange={(value) => update('phone', value)} />
            <Field label="Email" type="email" value={form.email} error={errors.email} placeholder="Enter email" onChange={(value) => update('email', value)} />
          </FormCard>

          <FormCard title="Sales and assignments">
            <SelectField
              label="Linked warehouse"
              value={form.warehouseId}
              error={errors.warehouseId}
              placeholder={form.branchId ? 'Select linked warehouse' : 'Select parent branch first'}
              options={linkedWarehouses}
              disabled={!form.branchId}
              onChange={(value) => update('warehouseId', value)}
            />
            <SelectField
              label="Price list"
              value={form.priceList}
              error={errors.priceList}
              placeholder="Select price list"
              options={withOption(priceLists, form.priceList)}
              onChange={(value) => update('priceList', value)}
            />
            <Field label="Cash account" value={form.cashAccount} error={errors.cashAccount} placeholder="Enter cash account" onChange={(value) => update('cashAccount', value)} />
            <Field label="Opening hours" value={form.openingHours} error={errors.openingHours} placeholder="Enter opening hours" onChange={(value) => update('openingHours', value)} />
            <SelectField
              label="Status"
              value={form.status}
              error={errors.status}
              placeholder="Select status"
              options={withOption(shopStatuses, form.status)}
              onChange={(value) => update('status', value)}
            />
          </FormCard>

          <FormCard title="Notes">
            <label className="block md:col-span-2">
              <span className="text-sm text-slate-700">Internal notes</span>
              <textarea
                value={form.notes}
                rows={3}
                placeholder="Add remarks for authorized workplace admins"
                onChange={(event) => update('notes', event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400"
              />
              {errors.notes && <p className="mt-1 text-xs text-rose-500">{errors.notes}</p>}
            </label>
          </FormCard>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/organization/shop')}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateShop.isPending}
              className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateShop.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Required fields. {shopRule}
          </p>
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900">{form.name || shop.name}</h2>
          <p className="mt-1 text-[13px] text-slate-400">{form.code || shop.code}</p>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClassName(statusLabel)}`}>
              {statusLabel}
            </span>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-slate-500">{shop.notes || shopRule}</p>
          <dl className="mt-5 space-y-3.5">
            <SideFact label="Branch" value={branchOptions.find((option) => option.value === form.branchId)?.label || branchNameOf(shop) || '—'} />
            <SideFact label="Created on" value={formatSideDate(shop.createdAt)} />
            <SideFact label="Updated" value={formatSideDate(shop.updatedAt)} />
            <SideFact label="Record status" value={statusLabel} />
          </dl>
          <div className="mt-5 rounded-xl bg-[#eef4ff] px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#2f6fed]">Access and relationships</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">{shopAccess}</p>
          </div>
          <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3.5">
            <p className="text-[13px] font-semibold text-slate-700">History is retained</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">
              Changes apply to this record. Existing documents retain their original references.
            </p>
          </div>
        </aside>
      </div>
    </form>
  )
}

function formatSideDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

function Message({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-center text-sm font-semibold shadow-sm ${className}`}>
      {children}
    </section>
  )
}

function FormCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({ label, required = false, value, error, placeholder, type = 'text', onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 ${
          error ? 'border-rose-300' : 'border-slate-200'
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

function SelectField({ label, required = false, value, error, placeholder, options, onChange, disabled = false }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <span className="relative mt-1.5 block">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-8 text-sm outline-none focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-50 ${
            error ? 'border-rose-300' : 'border-slate-200'
          } ${value ? 'text-slate-800' : 'text-slate-400'}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label || option.value}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
      </span>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
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

export default EditShopPage
