import api from './axios'

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data)

  return response.data
}

export const getCurrentUser = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  const response = await api.get('/auth/me', {
    data: { refreshToken },
  })

  return response.data
}
