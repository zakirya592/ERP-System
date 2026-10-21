import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProductCategory,
  getProductCategory,
  getProductCategories,
  updateProductCategory,
} from '../../api/productCategories.api'
import { queryKeys } from '../queryKeys'

export const useProductCategories = ({ page, limit, search, status }) => {
  return useQuery({
    queryKey: queryKeys.productCategories.list({ page, limit, search, status }),
    queryFn: () => getProductCategories({ page, limit, search, status }),
    placeholderData: keepPreviousData,
  })
}

export const useProductCategory = (id) => {
  return useQuery({
    queryKey: queryKeys.productCategories.detail(id),
    queryFn: () => getProductCategory(id),
    enabled: Boolean(id),
  })
}

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories', 'list'] })
    },
  })
}

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateProductCategory(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productCategories', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.productCategories.detail(variables.id) })
    },
  })
}
