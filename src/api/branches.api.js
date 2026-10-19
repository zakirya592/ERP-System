import api from './axios'

export const getBranches = async ({ page = 1, limit = 20, search = '', status = '' } = {}) => {
  const params = { page, limit, search }
  if (status === 'active' || status === 'inactive') params.status = status

  const response = await api.get('/branches', { params })

  return response.data
}

export const createBranch = async (data) => {
  const response = await api.post('/branches', data)

  return response.data
}
