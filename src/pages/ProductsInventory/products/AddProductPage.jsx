import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCreateProduct } from '../../../queries/products/products.queries'
import { ProductFormFields } from './ProductFormFields.jsx'
import { applyApiErrors, emptyProductForm, productPayload, validateProductForm } from './productRecords'

function AddProductPage() {
  const navigate = useNavigate()
  const createProduct = useCreateProduct()
  const [form, setForm] = useState(emptyProductForm)
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'trackBatch' && !value) next.trackExpiry = false
      if (key === 'quantityUnitId') next.packingUnitId = ''
      return next
    })
    setErrors((current) => ({
      ...current,
      [key]: '',
      ...(key === 'quantityUnitId' ? { packingUnitId: '' } : {}),
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateProductForm(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    createProduct.mutate(productPayload(form), {
      onSuccess: (data) => {
        toast.success(data?.message || 'Product created.')
        navigate('/products/products')
      },
      onError: (error) => {
        applyApiErrors(error, setErrors)
        toast.error(error.response?.data?.message || 'Could not save the product.')
      },
    })
  }

  return (
    <form className="mx-auto max-w-5xl space-y-4" onSubmit={handleSubmit}>
      <div>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/products/products" className="font-medium text-slate-700 hover:text-slate-900">
            Products
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Add Product</span>
        </nav>
        <h1 className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-slate-900">Add Product</h1>
        <p className="mt-2 text-sm text-slate-500">
          Create a product record with identity, units, pricing, and inventory tracking preferences.
        </p>
      </div>

      <ProductFormFields form={form} errors={errors} update={update} />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          <span className="text-rose-500">*</span> Required fields.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/products/products')}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createProduct.isPending}
            className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createProduct.isPending ? 'Saving' : 'Save Product'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default AddProductPage
