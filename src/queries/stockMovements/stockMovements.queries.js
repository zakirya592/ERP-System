import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getStockMovement, getStockMovements } from '../../api/stockMovements.api'
import { queryKeys } from '../queryKeys'

export const useStockMovements = ({
  page,
  limit,
  search,
  branchId,
  warehouseId,
  productId,
  movementType,
}) => {
  return useQuery({
    queryKey: queryKeys.stockMovements.list({
      page,
      limit,
      search,
      branchId,
      warehouseId,
      productId,
      movementType,
    }),
    queryFn: () =>
      getStockMovements({
        page,
        limit,
        search,
        branchId,
        warehouseId,
        productId,
        movementType,
      }),
    placeholderData: keepPreviousData,
  })
}

export const useStockMovement = (id) => {
  return useQuery({
    queryKey: queryKeys.stockMovements.detail(id),
    queryFn: () => getStockMovement(id),
    enabled: Boolean(id),
  })
}
