import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser, loginUser } from '../../api/auth.api'
import { queryKeys } from '../queryKeys'

export const useCurrentUser = () => {
  const hasToken = Boolean(localStorage.getItem('token'))

  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: getCurrentUser,
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data?.data?.accessToken) {
        localStorage.setItem('token', data.data.accessToken)
      }

      if (data?.data?.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken)
      }

      if (data?.data?.user) {
        localStorage.setItem('user', JSON.stringify(data.data.user))
      }

      queryClient.clear()
    },
  })
}
