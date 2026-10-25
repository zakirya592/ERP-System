import api from './axios'

export const getInventoryItems = async ({
  page = 1,
  limit = 10,
  search = '',
  warehouseId = '',
  branchId = '',
  productId = '',
  state = '',
  expiryRisk = '',
} = {}) => {
  const params = { page, limit, search }
  if (warehouseId) params.warehouseId = warehouseId
  if (branchId) params.branchId = branchId
  if (productId) params.productId = productId
  if (state) params.state = state
  if (expiryRisk) params.expiryRisk = expiryRisk

  const response = await api.get('/inventory-items', { params })

  return response.data
}

export const getInventoryItem = async (id) => {
  const response = await api.get(`/inventory-items/${id}`)

  return response.data
}
