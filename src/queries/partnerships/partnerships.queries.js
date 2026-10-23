import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPartnership, getPartnership, getPartnerships, updatePartnership, updatePartnershipStatus } from '../../api/partnerships.api'
import { queryKeys } from '../queryKeys'

export const usePartnerships = ({ page, limit, search, status, branchId }) => {
  return useQuery({
    queryKey: queryKeys.partnerships.list({ page, limit, search, status, branchId }),
    queryFn: () => getPartnerships({ page, limit, search, status, branchId }),
    placeholderData: keepPreviousData,
  })
}

export const usePartnership = (id) => {
  return useQuery({
    queryKey: queryKeys.partnerships.detail(id),
    queryFn: () => getPartnership(id),
    enabled: Boolean(id),
  })
}

export const useCreatePartnership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPartnership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerships', 'list'] })
    },
  })
}

export const useUpdatePartnershipStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => updatePartnershipStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partnerships', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.partnerships.detail(variables.id) })
    },
  })
}

export const useUpdatePartnership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updatePartnership(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partnerships', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.partnerships.detail(variables.id) })
    },
  })
}
