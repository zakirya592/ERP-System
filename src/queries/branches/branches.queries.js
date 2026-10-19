import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBranch, getBranch, getBranches, updateBranch } from '../../api/branches.api'
import { queryKeys } from '../queryKeys'

export const useBranches = ({ page, limit, search, status }) => {
  return useQuery({
    queryKey: queryKeys.branches.list({ page, limit, search, status }),
    queryFn: () => getBranches({ page, limit, search, status }),
    placeholderData: keepPreviousData,
  })
}

export const useBranch = (id) => {
  return useQuery({
    queryKey: queryKeys.branches.detail(id),
    queryFn: () => getBranch(id),
    enabled: Boolean(id),
  })
}

export const useUpdateBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateBranch(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['branches', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.detail(variables.id) })
    },
  })
}

export const useUpdateBranchStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => updateBranchStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['branches', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.detail(variables.id) })
    },
  })
}

export const useCreateBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches', 'list'] })
    },
  })
}
