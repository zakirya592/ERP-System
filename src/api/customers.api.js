import api from './axios'

export const getCustomers = async ({
  page = 1,
  limit = 20,
  search = '',
  status = '',
  paymentTerms = '',
  currencyId = '',
  branchId = '',
} = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status
  if (paymentTerms) params.paymentTerms = paymentTerms
  if (currencyId) params.currencyId = currencyId
  if (branchId) params.branchId = branchId

  const response = await api.get('/customers', { params })

  return response.data
}

export const getCustomer = async (id) => {
  const response = await api.get(`/customers/${id}`)

  return response.data
}

export const createCustomer = async (data) => {
  const response = await api.post('/customers', data)

  return response.data
}

export const updateCustomer = async (id, data) => {
  const response = await api.patch(`/customers/${id}`, data)

  return response.data
}
