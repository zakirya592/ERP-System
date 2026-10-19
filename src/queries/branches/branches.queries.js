import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBranch, getBranches } from '../../api/branches.api'
import { queryKeys } from '../queryKeys'

export const useBranches = ({ page, limit, search, status }) => {
  return useQuery({
    queryKey: queryKeys.branches.list({ page, limit, search, status }),
    queryFn: () => getBranches({ page, limit, search, status }),
    placeholderData: keepPreviousData,
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
