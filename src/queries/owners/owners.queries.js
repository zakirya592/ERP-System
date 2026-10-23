import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createOwner, getOwner, getOwners, updateOwner, updateOwnerStatus } from '../../api/owners.api'
import { queryKeys } from '../queryKeys'

export const useOwners = ({ page, limit, search, status, branchId }) => {
  return useQuery({
    queryKey: queryKeys.owners.list({ page, limit, search, status, branchId }),
    queryFn: () => getOwners({ page, limit, search, status, branchId }),
    placeholderData: keepPreviousData,
  })
}

export const useOwner = (id) => {
  return useQuery({
    queryKey: queryKeys.owners.detail(id),
    queryFn: () => getOwner(id),
    enabled: Boolean(id),
  })
}

export const useCreateOwner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners', 'list'] })
    },
  })
}

export const useUpdateOwnerStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => updateOwnerStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['owners', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.detail(variables.id) })
    },
  })
}

export const useUpdateOwner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateOwner(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['owners', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.detail(variables.id) })
    },
  })
}
