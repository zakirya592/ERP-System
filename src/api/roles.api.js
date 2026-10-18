import api from './axios'

export const getRoles = async () => {
  const response = await api.get('/roles', {
    params: { page: 1, limit: 100 },
  })

  return response.data
}
