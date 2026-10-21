import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCreateProductCategory, useProductCategories } from '../../../queries/productCategories/productCategories.queries.js'
import { applyApiErrors, categoryPayload, validateCategoryForm } from '../../MasterData/ProductCategories/categoryRecords.js'
import { CategoryForm } from './CategoryForm.jsx'

const emptyForm = {
  code: '',
  name: '',
  description: '',
  parentId: '',
  status: 'active',
}

function AddCategoryPage() {
  const navigate = useNavigate()
  const categoriesQuery = useProductCategories({ page: 1, limit: 100, search: '', status: '' })
  const createCategory = useCreateProductCategory()
  const categories = categoriesQuery.data?.data || []
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function save(event) {
    event.preventDefault()
    const nextErrors = validateCategoryForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    createCategory.mutate(categoryPayload(form), {
      onSuccess: (data) => {
        toast.success(data?.message || 'Category saved.')
        navigate('/products/categories')
      },
      onError: (error) => {
        applyApiErrors(error, setErrors)
        toast.error(error.response?.data?.message || 'Could not save the category.')
      },
    })
  }

  return (
    <form className="space-y-4" onSubmit={save}>
      <CategoryPageHeader
        title="Add Category"
        subtitle="Create a product classification with a unique code, an optional parent, and an active status."
      />
      <CategoryForm form={form} errors={errors} parents={categories} update={update} />
      <CategoryFormActions
        onCancel={() => navigate('/products/categories')}
        submitLabel={createCategory.isPending ? 'Saving' : 'Save Category'}
        disabled={createCategory.isPending}
      />
    </form>
  )
}

export function CategoryPageHeader({ title, subtitle, action }) {
  return (
    <>
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
              Dashboard
            </Link>
           
            <span>/</span>
            <Link to="/products/categories" className="font-medium text-slate-700 hover:text-slate-900">
              Categories
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-400">{title}</span>
          </nav>
          <h1 className="mt-2 text-[32px] leading-none font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 max-w-xl text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    </>
  )
}

export function CategoryFormActions({ onCancel, submitLabel, disabled = false }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        <span className="text-rose-500">*</span> Required fields. Enter a category name and unique code before saving.
      </p>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Cancel
        </button>
        <button type="submit" disabled={disabled} className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
          {submitLabel}
        </button>
      </div>
    </div>
  )
}

export default AddCategoryPage
