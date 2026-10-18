import api from './axios'

export const getUsers = async ({ page = 1, limit = 20, search = '', status = '' } = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status

  const response = await api.get('/users', { params })

  return response.data
}

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}`)

  return response.data
}

export const createUser = async (data) => {
  const response = await api.post('/users', data)

  return response.data
}

export const updateUser = async (id, data) => {
  const response = await api.patch(`/users/${id}`, data)

  return response.data
}
