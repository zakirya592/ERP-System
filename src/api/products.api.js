import api from './axios'

export const getProducts = async ({
  page = 1,
  limit = 20,
  search = '',
  status = '',
  categoryId = '',
} = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status
  if (categoryId) params.categoryId = categoryId

  const response = await api.get('/products', { params })

  return response.data
}

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`)

  return response.data
}

export const createProduct = async (data) => {
  const response = await api.post('/products', data)

  return response.data
}

export const updateProduct = async (id, data) => {
  const response = await api.patch(`/products/${id}`, data)

  return response.data
}
