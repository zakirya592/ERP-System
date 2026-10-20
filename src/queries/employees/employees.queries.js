import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createEmployee, getEmployee, getEmployees, updateEmployee, updateEmployeeStatus } from '../../api/employees.api'
import { queryKeys } from '../queryKeys'

export const useEmployees = ({ page, limit, search, status }) => {
  return useQuery({
    queryKey: queryKeys.employees.list({ page, limit, search, status }),
    queryFn: () => getEmployees({ page, limit, search, status }),
    placeholderData: keepPreviousData,
  })
}

export const useEmployee = (id) => {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => getEmployee(id),
    enabled: Boolean(id),
  })
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] })
    },
  })
}

export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => updateEmployeeStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(variables.id) })
    },
  })
}

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateEmployee(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(variables.id) })
    },
  })
}
