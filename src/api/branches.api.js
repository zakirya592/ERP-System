import api from './axios'

export const getBranches = async ({ page = 1, limit = 20, search = '', status = '' } = {}) => {
  const params = { page, limit, search }
  if (status === 'active' || status === 'inactive') params.status = status

  const response = await api.get('/branches', { params })

  return response.data
}

export const getBranch = async (id) => {
  const response = await api.get(`/branches/${id}`)

  return response.data
}

export const createBranch = async (data) => {
  const response = await api.post('/branches', data)

  return response.data
}

export const updateBranch = async (id, data) => {
  const response = await api.patch(`/branches/${id}`, data)

  return response.data
}
