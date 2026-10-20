import api from './axios'

export const getQuantityUnits = async ({ page = 1, limit = 20, search = '', status = '' } = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status

  const response = await api.get('/quantity-units', { params })

  return response.data
}

export const getQuantityUnit = async (id) => {
  const response = await api.get(`/quantity-units/${id}`)

  return response.data
}

export const createQuantityUnit = async (data) => {
  const response = await api.post('/quantity-units', data)

  return response.data
}

export const updateQuantityUnit = async (id, data) => {
  const response = await api.patch(`/quantity-units/${id}`, data)

  return response.data
}
