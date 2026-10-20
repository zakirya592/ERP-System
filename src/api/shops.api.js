import api from './axios'

export const getShops = async ({ page = 1, limit = 20, search = '', status = '', branchId = '' } = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status
  if (branchId) params.branchId = branchId

  const response = await api.get('/shops', { params })

  return response.data
}

export const getShop = async (id) => {
  const response = await api.get(`/shops/${id}`)

  return response.data
}

export const createShop = async (data) => {
  const response = await api.post('/shops', data)

  return response.data
}

export const updateShop = async (id, data) => {
  const response = await api.patch(`/shops/${id}`, data)

  return response.data
}

export const updateShopStatus = async (id, status) => {
  const response = await api.patch(`/shops/${id}/status`, { status })

  return response.data
}
