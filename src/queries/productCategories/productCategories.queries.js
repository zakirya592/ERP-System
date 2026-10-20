import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getProductCategories } from '../../api/productCategories.api'
import { queryKeys } from '../queryKeys'

export const useProductCategories = ({ page, limit, search, status }) => {
  return useQuery({
    queryKey: queryKeys.productCategories.list({ page, limit, search, status }),
    queryFn: () => getProductCategories({ page, limit, search, status }),
    placeholderData: keepPreviousData,
  })
}
