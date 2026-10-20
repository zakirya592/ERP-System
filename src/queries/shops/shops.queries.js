import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createShop, getShop, getShops, updateShop, updateShopStatus } from '../../api/shops.api'
import { queryKeys } from '../queryKeys'

export const useShops = ({ page, limit, search, status, branchId }) => {
  return useQuery({
    queryKey: queryKeys.shops.list({ page, limit, search, status, branchId }),
    queryFn: () => getShops({ page, limit, search, status, branchId }),
    placeholderData: keepPreviousData,
  })
}

export const useShop = (id) => {
  return useQuery({
    queryKey: queryKeys.shops.detail(id),
    queryFn: () => getShop(id),
    enabled: Boolean(id),
  })
}

export const useCreateShop = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops', 'list'] })
    },
  })
}

export const useUpdateShopStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => updateShopStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shops', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.detail(variables.id) })
    },
  })
}

export const useUpdateShop = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateShop(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shops', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.detail(variables.id) })
    },
  })
}
