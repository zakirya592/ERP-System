import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCurrency, getCurrencies, getCurrency, updateCurrency, updateCurrencyStatus } from '../../api/currencies.api'
import { queryKeys } from '../queryKeys'

export const useCurrencies = ({ page, limit, search, status }) => {
  return useQuery({
    queryKey: queryKeys.currencies.list({ page, limit, search, status }),
    queryFn: () => getCurrencies({ page, limit, search, status }),
    placeholderData: keepPreviousData,
  })
}

export const useCurrency = (id) => {
  return useQuery({
    queryKey: queryKeys.currencies.detail(id),
    queryFn: () => getCurrency(id),
    enabled: Boolean(id),
  })
}

export const useCreateCurrency = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies', 'list'] })
    },
  })
}

export const useUpdateCurrencyStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => updateCurrencyStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['currencies', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.currencies.detail(variables.id) })
    },
  })
}

export const useUpdateCurrency = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateCurrency(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['currencies', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.currencies.detail(variables.id) })
    },
  })
}
