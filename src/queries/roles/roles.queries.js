import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRole, getRole, getRoles, updateRole } from '../../api/roles.api'
import { queryKeys } from '../queryKeys'

export const useRoleList = ({ page, limit, search, status }) => {
  return useQuery({
    queryKey: queryKeys.roles.list({ page, limit, search, status }),
    queryFn: () => getRoles({ page, limit, search, status }),
    placeholderData: keepPreviousData,
  })
}

export const useRole = (id) => {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: () => getRole(id),
    enabled: Boolean(id),
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateRole(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(variables.id) })
    },
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
