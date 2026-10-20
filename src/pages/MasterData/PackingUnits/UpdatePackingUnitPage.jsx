import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { usePackingUnit, useUpdatePackingUnit } from '../../../queries/packingUnits/packingUnits.queries'
import { PackingUnitFields } from './AddPackingUnitPage.jsx'

const emptyForm = {
  name: '',
  shortCode: '',
  conversionQuantity: '',
  quantityUnitId: '',
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

function quantityUnitIdOf(unit) {
  const linked = unit?.quantityUnitId
  if (!linked) return ''
  if (typeof linked === 'string') return linked
  return linked._id || ''
}

function UpdatePackingUnitPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const unitQuery = usePackingUnit(id)
  const updateUnit = useUpdatePackingUnit()
  const unit = unitQuery.data?.data
  const [form, setForm] = useState(emptyForm)
  const [ready, setReady] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!unit || ready) return
    setForm({
      name: unit.name || '',
      shortCode: unit.shortCode || '',
      conversionQuantity: unit.conversionQuantity == null ? '' : String(unit.conversionQuantity),
      quantityUnitId: quantityUnitIdOf(unit),
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
    const conversionQuantity = form.conversionQuantity.trim()

    if (!name) nextErrors.name = 'Enter a name.'
    if (!shortCode) nextErrors.shortCode = 'Enter a short code.'
    else if (!/^[A-Z0-9]{1,10}$/.test(shortCode)) nextErrors.shortCode = 'Use 1 to 10 letters or numbers, for example CTN.'
    if (!conversionQuantity) nextErrors.conversionQuantity = 'Enter a conversion quantity.'
    else if (!/^\d+(\.\d+)?$/.test(conversionQuantity) || Number(conversionQuantity) <= 0) {
      nextErrors.conversionQuantity = 'Enter a quantity greater than zero.'
    }
    if (!form.quantityUnitId) nextErrors.quantityUnitId = 'Select a quantity unit.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    updateUnit.mutate(
      {
        id,
        name,
        shortCode,
        conversionQuantity,
        quantityUnitId: form.quantityUnitId,
        status: form.status,
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || 'Packing unit updated.')
          navigate('/master-data/packing-units')
        },
        onError: (error) => {
          applyApiErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not update the packing unit.')
        },
      },
    )
  }

  const linkedUnit = unit?.quantityUnitId && typeof unit.quantityUnitId === 'object' ? unit.quantityUnitId : null

  return (
    <form className="mx-auto max-w-5xl space-y-4" onSubmit={handleSubmit}>
      <div>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/master-data/packing-units" className="font-medium text-slate-700 hover:text-slate-900">
            Packing Units
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Update Packing Unit</span>
        </nav>
        <h1 className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-slate-900">Update Packing Unit</h1>
        <p className="mt-2 text-sm text-slate-500">Change the name, conversion, quantity unit, and status.</p>
      </div>

      {unitQuery.isLoading && (
        <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-10 text-sm text-slate-400 shadow-sm">
          Loading packing unit...
        </section>
      )}

      {unitQuery.isError && (
        <section className="rounded-2xl border border-rose-100 bg-white px-6 py-8 text-sm text-rose-500 shadow-sm">
          {unitQuery.error.response?.data?.message || 'Could not load this packing unit.'}
        </section>
      )}

      {ready && (
        <>
          <PackingUnitFields form={form} errors={errors} update={update} extraQuantityUnit={linkedUnit} />
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              <span className="text-rose-500">*</span> Required fields.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(`/master-data/packing-units/${id}`)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateUnit.isPending}
                className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateUnit.isPending ? 'Saving' : 'Save Packing Unit'}
              </button>
            </div>
          </div>
        </>
      )}
    </form>
  )
}

export default UpdatePackingUnitPage
