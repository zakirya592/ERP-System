export const emptyCategoryForm = {
  name: '',
  code: '',
  parentId: '',
  description: '',
  status: 'active',
}

export function parentIdOf(category) {
  const parent = category?.parentId
  if (!parent) return ''
  if (typeof parent === 'string') return parent
  return parent._id || ''
}

export function parentLabel(category, categories = []) {
  const parent = category?.parentId
  if (!parent) return '—'
  if (typeof parent === 'object') {
    return parent.code ? `${parent.name} (${parent.code})` : parent.name || '—'
  }
  const match = categories.find((item) => item._id === parent)
  if (!match) return '—'
  return match.code ? `${match.name} (${match.code})` : match.name
}

export function categoryToForm(category) {
  return {
    name: category.name || '',
    code: category.code || '',
    parentId: parentIdOf(category),
    description: category.description || '',
    status: category.status || 'active',
  }
}

export function validateCategoryForm(form) {
  const nextErrors = {}
  const name = form.name.trim()
  const code = form.code.trim().toUpperCase()

  if (!name) nextErrors.name = 'Enter a name.'
  if (!code) nextErrors.code = 'Enter a code.'
  else if (!/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(code) || code.length > 20) {
    nextErrors.code = 'Use letters, numbers, and hyphens, for example CAT-A.'
  }

  return nextErrors
}

export function categoryPayload(form) {
  return {
    name: form.name.trim(),
    code: form.code.trim().toUpperCase(),
    parentId: form.parentId || null,
    description: form.description.trim(),
    status: form.status,
  }
}

export function applyApiErrors(error, setErrors) {
  const apiErrors = error.response?.data?.errors
  if (!Array.isArray(apiErrors)) return
  const fieldErrors = {}
  apiErrors.forEach((item) => {
    if (item.field && !fieldErrors[item.field]) fieldErrors[item.field] = item.message
  })
  setErrors((current) => ({ ...current, ...fieldErrors }))
}

export function formatWhen(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function statusLabel(status) {
  if (!status) return '—'
  return status.charAt(0).toUpperCase() + status.slice(1)
}
