import { getBranches } from '../api/branches.api'
import { getCurrencies } from '../api/currencies.api'
import { getPackingUnits } from '../api/packingUnits.api'
import { getQuantityUnits } from '../api/quantityUnits.api'
import { getEmployees } from '../api/employees.api'
import { getShops } from '../api/shops.api'
import { getWarehouses } from '../api/warehouses.api'
import { getPermissions } from '../api/permissions.api'
import { getRoles } from '../api/roles.api'
import { getUsers } from '../api/users.api'
import { queryKeys } from './queryKeys'

const staleTime = 60 * 1000

export const dashboardListParams = {
  users: { page: 1, limit: 20, search: '', status: '' },
  roles: { page: 1, limit: 20, search: '', status: '' },
  permissions: { page: 1, limit: 20, search: '' },
  branches: { page: 1, limit: 20, search: '', status: '' },
  employees: { page: 1, limit: 20, search: '', status: '' },
  shops: { page: 1, limit: 20, search: '', status: '', branchId: '' },
  warehouses: { page: 1, limit: 20, search: '', status: '', branchId: '' },
  currencies: { page: 1, limit: 20, search: '', status: '' },
  quantityUnits: { page: 1, limit: 20, search: '', status: '' },
  packingUnits: { page: 1, limit: 20, search: '', status: '', quantityUnitId: '' },
}

export const dashboardListQueries = [
  {
    queryKey: queryKeys.users.list(dashboardListParams.users),
    queryFn: () => getUsers(dashboardListParams.users),
    staleTime,
  },
  {
    queryKey: queryKeys.roles.list(dashboardListParams.roles),
    queryFn: () => getRoles(dashboardListParams.roles),
    staleTime,
  },
  {
    queryKey: queryKeys.permissions.list(dashboardListParams.permissions),
    queryFn: () => getPermissions(dashboardListParams.permissions),
    staleTime,
  },
  {
    queryKey: queryKeys.branches.list(dashboardListParams.branches),
    queryFn: () => getBranches(dashboardListParams.branches),
    staleTime,
  },
  {
    queryKey: queryKeys.employees.list(dashboardListParams.employees),
    queryFn: () => getEmployees(dashboardListParams.employees),
    staleTime,
  },
  {
    queryKey: queryKeys.shops.list(dashboardListParams.shops),
    queryFn: () => getShops(dashboardListParams.shops),
    staleTime,
  },
  {
    queryKey: queryKeys.warehouses.list(dashboardListParams.warehouses),
    queryFn: () => getWarehouses(dashboardListParams.warehouses),
    staleTime,
  },
  {
    queryKey: queryKeys.currencies.list(dashboardListParams.currencies),
    queryFn: () => getCurrencies(dashboardListParams.currencies),
    staleTime,
  },
  {
    queryKey: queryKeys.quantityUnits.list(dashboardListParams.quantityUnits),
    queryFn: () => getQuantityUnits(dashboardListParams.quantityUnits),
    staleTime,
  },
  {
    queryKey: queryKeys.packingUnits.list(dashboardListParams.packingUnits),
    queryFn: () => getPackingUnits(dashboardListParams.packingUnits),
    staleTime,
  },
]

export function prefetchDashboard(queryClient) {
  return Promise.all(dashboardListQueries.map((query) => queryClient.prefetchQuery(query)))
}
