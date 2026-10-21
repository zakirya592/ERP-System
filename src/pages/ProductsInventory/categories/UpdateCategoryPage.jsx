import { useEffect, useState } from 'react'
import {  useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useProductCategories, useProductCategory, useUpdateProductCategory } from '../../../queries/productCategories/productCategories.queries.js'
import {
  applyApiErrors,
  categoryPayload,
  categoryToForm,
  emptyCategoryForm,
  parentIdOf,
  validateCategoryForm,
} from '../../MasterData/ProductCategories/categoryRecords.js'
import { CategoryFormActions, CategoryPageHeader } from './AddCategoryPage.jsx'
import { CategoryForm } from './CategoryForm.jsx'

function descendantIds(id, list) {
  const found = new Set()
  function walk(parentId) {
    list.forEach((item) => {
      if (parentIdOf(item) === parentId && !found.has(item._id)) {
        found.add(item._id)
        walk(item._id)
      }
    })
  }
  walk(id)
  return found
}

function UpdateCategoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const categoryQuery = useProductCategory(id)
  const categoriesQuery = useProductCategories({ page: 1, limit: 100, search: '', status: '' })
  const updateCategory = useUpdateProductCategory()
  const category = categoryQuery.data?.data
  const categories = categoriesQuery.data?.data || []
  const [form, setForm] = useState(emptyCategoryForm)
  const [ready, setReady] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setReady(false)
  }, [id])

  useEffect(() => {
    if (!category || ready) return
    setForm(categoryToForm(category))
    setReady(true)
  }, [category, ready])

  const blocked = descendantIds(id, categories)
  const parents = categories.filter((item) => item._id !== id && !blocked.has(item._id))

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function save(event) {
    event.preventDefault()
    const nextErrors = validateCategoryForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    updateCategory.mutate(
      { id, ...categoryPayload(form) },
      {
        onSuccess: (data) => {
          toast.success(data?.message || 'Category updated.')
          navigate(`/products/categories`)
        },
        onError: (error) => {
          applyApiErrors(error, setErrors)
          toast.error(error.response?.data?.message || 'Could not update the category.')
        },
      },
    )
  }

  return (
    <form className="space-y-4" onSubmit={save}>
      <CategoryPageHeader
        title="Update Category"
        subtitle="Update the classification, parent, and whether this category is available for products."
      />

      {categoryQuery.isLoading && <Panel>Loading category...</Panel>}
      
      {ready && (
        <>
          <CategoryForm form={form} errors={errors} parents={parents} update={update} />
          <CategoryFormActions
            onCancel={() => navigate(`/products/categories/${id}`)}
            submitLabel={updateCategory.isPending ? 'Saving' : 'Save changes'}
            disabled={updateCategory.isPending}
          />
        </>
      )}
    </form>
  )
}

function Panel({ children, className = 'text-slate-400' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-sm shadow-sm ${className}`}>
      {children}
    </section>
  )
}

export default UpdateCategoryPage
