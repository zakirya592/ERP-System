import api from './axios'

export const getEmployees = async ({ page = 1, limit = 20, search = '', status = '' } = {}) => {
  const params = { page, limit, search }
  if (status) params.status = status

  const response = await api.get('/employees', { params })

  return response.data
}

export const getEmployee = async (id) => {
  const response = await api.get(`/employees/${id}`)

  return response.data
}

export const createEmployee = async (data) => {
  const response = await api.post('/employees', data)

  return response.data
}

export const updateEmployee = async (id, data) => {
  const response = await api.patch(`/employees/${id}`, data)

  return response.data
}

export const updateEmployeeStatus = async (id, status) => {
  const response = await api.patch(`/employees/${id}/status`, { status })

  return response.data
}
