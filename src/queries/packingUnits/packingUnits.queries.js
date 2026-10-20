import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPackingUnit, getPackingUnit, getPackingUnits, updatePackingUnit } from '../../api/packingUnits.api'
import { queryKeys } from '../queryKeys'

export const usePackingUnits = ({ page, limit, search, status, quantityUnitId }) => {
  return useQuery({
    queryKey: queryKeys.packingUnits.list({ page, limit, search, status, quantityUnitId }),
    queryFn: () => getPackingUnits({ page, limit, search, status, quantityUnitId }),
    placeholderData: keepPreviousData,
  })
}

export const usePackingUnit = (id) => {
  return useQuery({
    queryKey: queryKeys.packingUnits.detail(id),
    queryFn: () => getPackingUnit(id),
    enabled: Boolean(id),
  })
}

export const useCreatePackingUnit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPackingUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingUnits', 'list'] })
    },
  })
}

export const useUpdatePackingUnit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updatePackingUnit(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packingUnits', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.packingUnits.detail(variables.id) })
    },
  })
}
