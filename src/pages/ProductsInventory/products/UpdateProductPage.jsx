import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useProduct, useUpdateProduct } from '../../../queries/products/products.queries'
import { ProductFormFields } from './ProductFormFields.jsx'
import { applyApiErrors, emptyProductForm, productPayload, productToForm, validateProductForm } from './productRecords'

function UpdateProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const productQuery = useProduct(id)
  const updateProduct = useUpdateProduct()
  const product = productQuery.data?.data
  const [form, setForm] = useState(emptyProductForm)
  const [ready, setReady] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!product || ready) return
    setForm(productToForm(product))
    setReady(true)
  }, [product, ready])

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

    updateProduct.mutate(
      { id, ...productPayload(form) },
      {
        onSuccess: (data) => {
          toast.success(data?.message || 'Product updated.')
          navigate('/products/products')
        },
        onError: (error) => {
          applyApiErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not update the product.')
        },
      },
    )
  }

  return (
    <form className="mx-auto space-y-4" onSubmit={handleSubmit}>
      <div>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/products/products" className="font-medium text-slate-700 hover:text-slate-900">
            Products & Inventory
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-400">Update Product</span>
        </nav>
        <h1 className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-slate-900">Update Product</h1>
        <p className="mt-2 text-sm text-slate-500">Change identity, units, pricing, tracking, and status.</p>
      </div>

      {productQuery.isLoading && (
        <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-10 text-sm text-slate-400 shadow-sm">
          Loading product...
        </section>
      )}

      {productQuery.isError && (
        <section className="rounded-2xl border border-rose-100 bg-white px-6 py-8 text-sm text-rose-500 shadow-sm">
          {productQuery.error.response?.data?.message || 'Could not load this product.'}
        </section>
      )}

      {ready && (
        <>
          <ProductFormFields form={form} errors={errors} update={update} product={product} />

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              <span className="text-rose-500">*</span> Required fields.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(`/products/products/${id}`)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProduct.isPending}
                className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateProduct.isPending ? 'Saving' : 'Save Product'}
              </button>
            </div>
          </div>
        </>
      )}
    </form>
  )
}

export default UpdateProductPage
