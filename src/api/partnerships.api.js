import api from './axios'

export const getPartnerships = async ({ page = 1, limit = 20, search = '', status = '', branchId = '' } = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status
  if (branchId) params.branchId = branchId

  const response = await api.get('/partnerships', { params })

  return response.data
}

export const getPartnership = async (id) => {
  const response = await api.get(`/partnerships/${id}`)

  return response.data
}

export const createPartnership = async (data) => {
  const response = await api.post('/partnerships', data)

  return response.data
}

export const updatePartnership = async (id, data) => {
  const response = await api.patch(`/partnerships/${id}`, data)

  return response.data
}

export const updatePartnershipStatus = async (id, status) => {
  const response = await api.patch(`/partnerships/${id}/status`, { status })

  return response.data
}
