import api from './axios'

export const getCurrencies = async ({ page = 1, limit = 20, search = '', status = '' } = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status

  const response = await api.get('/currencies', { params })

  return response.data
}

export const getCurrency = async (id) => {
  const response = await api.get(`/currencies/${id}`)

  return response.data
}

export const createCurrency = async (data) => {
  const response = await api.post('/currencies', data)

  return response.data
}

export const updateCurrency = async (id, data) => {
  const response = await api.patch(`/currencies/${id}`, data)

  return response.data
}

export const updateCurrencyStatus = async (id, status) => {
  const response = await api.patch(`/currencies/${id}/status`, { status })

  return response.data
}
