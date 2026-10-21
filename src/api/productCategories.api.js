import api from './axios'

export const getProductCategories = async ({ page = 1, limit = 100, search = '', status = '' } = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status

  const response = await api.get('/product-categories', { params })

  return response.data
}

export const getProductCategory = async (id) => {
  const response = await api.get(`/product-categories/${id}`)

  return response.data
}

export const createProductCategory = async (data) => {
  const response = await api.post('/product-categories', data)

  return response.data
}

export const updateProductCategory = async (id, data) => {
  const response = await api.patch(`/product-categories/${id}`, data)

  return response.data
}
