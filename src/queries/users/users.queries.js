import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRoles } from '../../api/roles.api'
import { createUser, getUser, getUsers, updateUser } from '../../api/users.api'
import { queryKeys } from '../queryKeys'

export const useUsers = ({ page, limit, search, status }) => {
  return useQuery({
    queryKey: queryKeys.users.list({ page, limit, search, status }),
    queryFn: () => getUsers({ page, limit, search, status }),
    placeholderData: keepPreviousData,
  })
}

export const useUser = (id) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => getUser(id),
    enabled: Boolean(id),
  })
}

export const useRoles = () => {
  return useQuery({
    queryKey: queryKeys.roles.list({ page: 1, limit: 100 }),
    queryFn: () => getRoles({ page: 1, limit: 100 }),
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateUser(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) })
    },
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
    },
  })
}
