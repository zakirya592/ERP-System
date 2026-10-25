import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCustomer, getCustomer, getCustomers, updateCustomer } from '../../api/customers.api'
import { queryKeys } from '../queryKeys'

export const useCustomers = ({ page, limit, search, status, paymentTerms, currencyId, branchId }) => {
  return useQuery({
    queryKey: queryKeys.customers.list({ page, limit, search, status, paymentTerms, currencyId, branchId }),
    queryFn: () => getCustomers({ page, limit, search, status, paymentTerms, currencyId, branchId }),
    placeholderData: keepPreviousData,
  })
}

export const useCustomer = (id) => {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => getCustomer(id),
    enabled: Boolean(id),
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] })
    },
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateCustomer(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(variables.id) })
    },
  })
}
