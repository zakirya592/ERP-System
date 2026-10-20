import api from './axios'

export const getProductCategories = async ({ page = 1, limit = 100, search = '', status = '' } = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status

  const response = await api.get('/product-categories', { params })

  return response.data
}
