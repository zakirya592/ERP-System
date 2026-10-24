import api from './axios'

export const getStockMovements = async ({
  page = 1,
  limit = 20,
  search = '',
  branchId = '',
  warehouseId = '',
  productId = '',
  movementType = '',
} = {}) => {
  const params = { page, limit, search }
  if (branchId) params.branchId = branchId
  if (warehouseId) params.warehouseId = warehouseId
  if (productId) params.productId = productId
  if (movementType) params.movementType = movementType

  const response = await api.get('/stock-movements', { params })

  return response.data
}

export const getStockMovement = async (id) => {
  const response = await api.get(`/stock-movements/${id}`)

  return response.data
}
