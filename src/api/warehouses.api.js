import api from './axios'

export const getWarehouses = async ({ page = 1, limit = 20, search = '', status = '', branchId = '' } = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status
  if (branchId) params.branchId = branchId

  const response = await api.get('/warehouses', { params })

  return response.data
}

export const getWarehouse = async (id) => {
  const response = await api.get(`/warehouses/${id}`)

  return response.data
}

export const createWarehouse = async (data) => {
  const response = await api.post('/warehouses', data)

  return response.data
}

export const updateWarehouse = async (id, data) => {
  const response = await api.patch(`/warehouses/${id}`, data)

  return response.data
}

export const updateWarehouseStatus = async (id, status) => {
  const response = await api.patch(`/warehouses/${id}/status`, { status })

  return response.data
}
