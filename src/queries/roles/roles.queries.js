import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRole, getRoles } from '../../api/roles.api'
import { queryKeys } from '../queryKeys'

export const useRoleList = ({ page, limit, search, status }) => {
  return useQuery({
    queryKey: queryKeys.roles.list({ page, limit, search, status }),
    queryFn: () => getRoles({ page, limit, search, status }),
    placeholderData: keepPreviousData,
  })
}

export const useCreateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', 'list'] })
    },
  })
}
