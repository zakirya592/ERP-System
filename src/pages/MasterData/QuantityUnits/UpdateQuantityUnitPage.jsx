import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useQuantityUnit, useUpdateQuantityUnit } from '../../../queries/quantityUnits/quantityUnits.queries'
import { UnitFields } from './AddQuantityUnitPage.jsx'

const emptyForm = {
  name: '',
  shortCode: '',
  decimalAllowed: true,
  status: 'active',
}

function applyApiErrors(error, setErrors) {
  const apiErrors = error.response?.data?.errors
  if (!Array.isArray(apiErrors)) return
  const fieldErrors = {}
  apiErrors.forEach((item) => {
    if (item.field && !fieldErrors[item.field]) fieldErrors[item.field] = item.message
  })
  setErrors((current) => ({ ...current, ...fieldErrors }))
}

function UpdateQuantityUnitPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const unitQuery = useQuantityUnit(id)
  const updateUnit = useUpdateQuantityUnit()
  const unit = unitQuery.data?.data
  const [form, setForm] = useState(emptyForm)
  const [ready, setReady] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!unit || ready) return
    setForm({
      name: unit.name || '',
      shortCode: unit.shortCode || '',
      decimalAllowed: Boolean(unit.decimalAllowed),
      status: unit.status || 'active',
    })
    setReady(true)
  }, [unit, ready])

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    const name = form.name.trim()
    const shortCode = form.shortCode.trim().toUpperCase()

    if (!name) nextErrors.name = 'Enter a name.'
    if (!shortCode) nextErrors.shortCode = 'Enter a short code.'
    else if (!/^[A-Z0-9]{1,10}$/.test(shortCode)) nextErrors.shortCode = 'Use 1 to 10 letters or numbers, for example KG.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    updateUnit.mutate(
      {
        id,
        name,
        shortCode,
        decimalAllowed: form.decimalAllowed,
        status: form.status,
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || 'Quantity unit updated.')
          navigate(`/master-data/units`)
        },
        onError: (error) => {
          applyApiErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not update the quantity unit.')
        },
      },
    )
  }

  return (
    <form className="mx-auto max-w-5xl space-y-4" onSubmit={handleSubmit}>
      <div>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/master-data/units" className="font-medium text-slate-700 hover:text-slate-900">
            Quantity Units
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Update Unit</span>
        </nav>
        <h1 className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-slate-900">Update Quantity Unit</h1>
        <p className="mt-2 text-sm text-slate-500">Change the name, short code, decimals, and status.</p>
      </div>

      {unitQuery.isLoading && (
        <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-10 text-sm text-slate-400 shadow-sm">
          Loading quantity unit...
        </section>
      )}

      {unitQuery.isError && (
        <section className="rounded-2xl border border-rose-100 bg-white px-6 py-8 text-sm text-rose-500 shadow-sm">
          {unitQuery.error.response?.data?.message || 'Could not load this quantity unit.'}
        </section>
      )}

      {ready && (
        <>
          <UnitFields form={form} errors={errors} update={update} />
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              <span className="text-rose-500">*</span> Required fields.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(`/master-data/units/${id}`)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateUnit.isPending}
                className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateUnit.isPending ? 'Saving' : 'Save Unit'}
              </button>
            </div>
          </div>
        </>
      )}
    </form>
  )
}

export default UpdateQuantityUnitPage
