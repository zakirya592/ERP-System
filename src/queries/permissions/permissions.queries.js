import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getPermissions } from '../../api/permissions.api'
import { queryKeys } from '../queryKeys'

export const usePermissions = ({ page, limit, search }) => {
  return useQuery({
    queryKey: queryKeys.permissions.list({ page, limit, search }),
    queryFn: () => getPermissions({ page, limit, search }),
    placeholderData: keepPreviousData,
  })
}
