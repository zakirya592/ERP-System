import api from './axios'

export const getRoles = async ({ page = 1, limit = 20, search = '', status = '' } = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status

  const response = await api.get('/roles', { params })

  return response.data
}

export const getRole = async (id) => {
  const response = await api.get(`/roles/${id}`)

  return response.data
}

export const createRole = async (data) => {
  const response = await api.post('/roles', data)

  return response.data
}

export const updateRole = async (id, data) => {
  const response = await api.patch(`/roles/${id}`, data)

  return response.data
}
