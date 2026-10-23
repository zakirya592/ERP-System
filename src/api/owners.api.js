import api from './axios'

export const getOwners = async ({ page = 1, limit = 20, search = '', status = '', branchId = '' } = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status
  if (branchId) params.branchId = branchId

  const response = await api.get('/owners', { params })

  return response.data
}

export const getOwner = async (id) => {
  const response = await api.get(`/owners/${id}`)

  return response.data
}

export const createOwner = async (data) => {
  const response = await api.post('/owners', data)

  return response.data
}

export const updateOwner = async (id, data) => {
  const response = await api.patch(`/owners/${id}`, data)

  return response.data
}

export const updateOwnerStatus = async (id, status) => {
  const response = await api.patch(`/owners/${id}/status`, { status })

  return response.data
}
