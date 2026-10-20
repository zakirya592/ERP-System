import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProduct, getProduct, getProducts, updateProduct } from '../../api/products.api'
import { queryKeys } from '../queryKeys'

export const useProducts = ({ page, limit, search, status, categoryId }) => {
  return useQuery({
    queryKey: queryKeys.products.list({ page, limit, search, status, categoryId }),
    queryFn: () => getProducts({ page, limit, search, status, categoryId }),
    placeholderData: keepPreviousData,
  })
}

export const useProduct = (id) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] })
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateProduct(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) })
    },
  })
}
