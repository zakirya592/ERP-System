import api from './axios'

export const getPackingUnits = async ({
  page = 1,
  limit = 20,
  search = '',
  status = '',
  quantityUnitId = '',
} = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status
  if (quantityUnitId) params.quantityUnitId = quantityUnitId

  const response = await api.get('/packing-units', { params })

  return response.data
}

export const getPackingUnit = async (id) => {
  const response = await api.get(`/packing-units/${id}`)

  return response.data
}

export const createPackingUnit = async (data) => {
  const response = await api.post('/packing-units', data)

  return response.data
}

export const updatePackingUnit = async (id, data) => {
  const response = await api.patch(`/packing-units/${id}`, data)

  return response.data
}
