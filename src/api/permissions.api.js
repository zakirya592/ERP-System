import api from './axios'

export const getPermissions = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const response = await api.get('/permissions', {
    params: { page, limit, search },
  })

  return response.data
}
