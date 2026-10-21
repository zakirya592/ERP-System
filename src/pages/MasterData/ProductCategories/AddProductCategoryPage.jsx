import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCreateProductCategory } from '../../../queries/productCategories/productCategories.queries'
import { CategoryFields } from './CategoryFields.jsx'
import { applyApiErrors, categoryPayload, emptyCategoryForm, validateCategoryForm } from './categoryRecords'

function AddProductCategoryPage() {
  const navigate = useNavigate()
  const createCategory = useCreateProductCategory()
  const [form, setForm] = useState(emptyCategoryForm)
  const [errors, setErrors] = useState({})

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

    createCategory.mutate(categoryPayload(form), {
      onSuccess: (data) => {
        toast.success(data?.message || 'Product category created.')
        navigate('/master-data/categories')
      },
      onError: (error) => {
        applyApiErrors(error, setErrors)
        toast.error(error.response?.data?.message || 'Could not save the product category.')
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
          <Link to="/master-data/categories" className="font-medium text-slate-700 hover:text-slate-900">
            Product Categories
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Add Category</span>
        </nav>
        <h1 className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-slate-900">Add Product Category</h1>
        <p className="mt-2 text-sm text-slate-500">Name the category and choose a parent when it belongs under another one.</p>
      </div>

      <CategoryFields form={form} errors={errors} update={update} />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          <span className="text-rose-500">*</span> Required fields.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/master-data/categories')}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createCategory.isPending}
            className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createCategory.isPending ? 'Saving' : 'Save Category'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default AddProductCategoryPage
