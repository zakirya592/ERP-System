import { getPermissions } from '../api/permissions.api'
import { getRoles } from '../api/roles.api'
import { getUsers } from '../api/users.api'
import { queryKeys } from './queryKeys'

const staleTime = 60 * 1000

export const dashboardListParams = {
  users: { page: 1, limit: 20, search: '', status: '' },
  roles: { page: 1, limit: 20, search: '', status: '' },
  permissions: { page: 1, limit: 20, search: '' },
}

export const dashboardListQueries = [
  {
    queryKey: queryKeys.users.list(dashboardListParams.users),
    queryFn: () => getUsers(dashboardListParams.users),
    staleTime,
  },
  {
    queryKey: queryKeys.roles.list(dashboardListParams.roles),
    queryFn: () => getRoles(dashboardListParams.roles),
    staleTime,
  },
  {
    queryKey: queryKeys.permissions.list(dashboardListParams.permissions),
    queryFn: () => getPermissions(dashboardListParams.permissions),
    staleTime,
  },
]

export function prefetchDashboard(queryClient) {
  return Promise.all(dashboardListQueries.map((query) => queryClient.prefetchQuery(query)))
}
