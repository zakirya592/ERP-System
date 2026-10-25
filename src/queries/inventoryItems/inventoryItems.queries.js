import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getInventoryItem, getInventoryItems } from '../../api/inventoryItems.api'
import { queryKeys } from '../queryKeys'

export const useInventoryItems = ({
  page,
  limit,
  search,
  warehouseId,
  branchId,
  productId,
  state,
  expiryRisk,
}) => {
  return useQuery({
    queryKey: queryKeys.inventoryItems.list({
      page,
      limit,
      search,
      warehouseId,
      branchId,
      productId,
      state,
      expiryRisk,
    }),
    queryFn: () =>
      getInventoryItems({
        page,
        limit,
        search,
        warehouseId,
        branchId,
        productId,
        state,
        expiryRisk,
      }),
    placeholderData: keepPreviousData,
  })
}

export const useInventoryItem = (id) => {
  return useQuery({
    queryKey: queryKeys.inventoryItems.detail(id),
    queryFn: () => getInventoryItem(id),
    enabled: Boolean(id),
  })
}
