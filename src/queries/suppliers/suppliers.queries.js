import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSupplier, getSupplier, getSuppliers, updateSupplier } from '../../api/suppliers.api'
import { queryKeys } from '../queryKeys'

export const useSuppliers = ({ page, limit, search, status, paymentTerms, currencyId, branchId }) => {
  return useQuery({
    queryKey: queryKeys.suppliers.list({ page, limit, search, status, paymentTerms, currencyId, branchId }),
    queryFn: () => getSuppliers({ page, limit, search, status, paymentTerms, currencyId, branchId }),
    placeholderData: keepPreviousData,
  })
}

export const useSupplier = (id) => {
  return useQuery({
    queryKey: queryKeys.suppliers.detail(id),
    queryFn: () => getSupplier(id),
    enabled: Boolean(id),
  })
}

export const useCreateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'list'] })
    },
  })
}

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateSupplier(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.detail(variables.id) })
    },
  })
}
