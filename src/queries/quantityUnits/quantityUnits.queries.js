import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createQuantityUnit, getQuantityUnit, getQuantityUnits, updateQuantityUnit } from '../../api/quantityUnits.api'
import { queryKeys } from '../queryKeys'

export const useQuantityUnits = ({ page, limit, search, status }) => {
  return useQuery({
    queryKey: queryKeys.quantityUnits.list({ page, limit, search, status }),
    queryFn: () => getQuantityUnits({ page, limit, search, status }),
    placeholderData: keepPreviousData,
  })
}

export const useQuantityUnit = (id) => {
  return useQuery({
    queryKey: queryKeys.quantityUnits.detail(id),
    queryFn: () => getQuantityUnit(id),
    enabled: Boolean(id),
  })
}

export const useCreateQuantityUnit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createQuantityUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantityUnits', 'list'] })
    },
  })
}

export const useUpdateQuantityUnit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateQuantityUnit(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quantityUnits', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.quantityUnits.detail(variables.id) })
    },
  })
}
