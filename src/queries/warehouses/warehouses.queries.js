import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createWarehouse, getWarehouse, getWarehouses, updateWarehouse, updateWarehouseStatus } from '../../api/warehouses.api'
import { queryKeys } from '../queryKeys'

export const useWarehouses = ({ page, limit, search, status, branchId }) => {
  return useQuery({
    queryKey: queryKeys.warehouses.list({ page, limit, search, status, branchId }),
    queryFn: () => getWarehouses({ page, limit, search, status, branchId }),
    placeholderData: keepPreviousData,
  })
}

export const useWarehouse = (id) => {
  return useQuery({
    queryKey: queryKeys.warehouses.detail(id),
    queryFn: () => getWarehouse(id),
    enabled: Boolean(id),
  })
}

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses', 'list'] })
    },
  })
}

export const useUpdateWarehouseStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => updateWarehouseStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.detail(variables.id) })
    },
  })
}

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateWarehouse(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.detail(variables.id) })
    },
  })
}
