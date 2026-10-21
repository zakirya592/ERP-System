import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useProductCategory, useUpdateProductCategory } from '../../../queries/productCategories/productCategories.queries'
import { CategoryFields } from './CategoryFields.jsx'
import { applyApiErrors, categoryPayload, categoryToForm, emptyCategoryForm, validateCategoryForm } from './categoryRecords'

function UpdateProductCategoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const categoryQuery = useProductCategory(id)
  const updateCategory = useUpdateProductCategory()
  const category = categoryQuery.data?.data
  const [form, setForm] = useState(emptyCategoryForm)
  const [ready, setReady] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!category || ready) return
    setForm(categoryToForm(category))
    setReady(true)
  }, [category, ready])

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateCategoryForm(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    updateCategory.mutate(
      { id, ...categoryPayload(form) },
      {
        onSuccess: (data) => {
          toast.success(data?.message || 'Product category updated.')
          navigate('/master-data/categories')
        },
        onError: (error) => {
          applyApiErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not update the product category.')
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
          <Link to="/master-data/categories" className="font-medium text-slate-700 hover:text-slate-900">
            Product Categories
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Update Category</span>
        </nav>
        <h1 className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-slate-900">Update Product Category</h1>
        <p className="mt-2 text-sm text-slate-500">Change the name, code, parent, description, and status.</p>
      </div>

      {categoryQuery.isLoading && (
        <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-10 text-sm text-slate-400 shadow-sm">
          Loading product category...
        </section>
      )}

      {categoryQuery.isError && (
        <section className="rounded-2xl border border-rose-100 bg-white px-6 py-8 text-sm text-rose-500 shadow-sm">
          {categoryQuery.error.response?.data?.message || 'Could not load this product category.'}
        </section>
      )}

      {ready && (
        <>
          <CategoryFields form={form} errors={errors} update={update} category={category} />

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              <span className="text-rose-500">*</span> Required fields.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(`/master-data/categories/${id}`)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateCategory.isPending}
                className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateCategory.isPending ? 'Saving' : 'Save Category'}
              </button>
            </div>
          </div>
        </>
      )}
    </form>
  )
}

export default UpdateProductCategoryPage
