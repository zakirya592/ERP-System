import api from './axios'

export const getSuppliers = async ({
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

  const response = await api.get('/suppliers', { params })

  return response.data
}

export const getSupplier = async (id) => {
  const response = await api.get(`/suppliers/${id}`)

  return response.data
}

export const createSupplier = async (data) => {
  const response = await api.post('/suppliers', data)

  return response.data
}

export const updateSupplier = async (id, data) => {
  const response = await api.patch(`/suppliers/${id}`, data)

  return response.data
}
