export const queryKeys = {
  auth: {
    currentUser: () => ['auth', 'currentUser'],
  },
  users: {
    list: (params) => ['users', 'list', params],
    detail: (id) => ['users', 'detail', id],
  },
  roles: {
    list: (params) => ['roles', 'list', params],
    detail: (id) => ['roles', 'detail', id],
  },
  permissions: {
    list: (params) => ['permissions', 'list', params],
  },
  branches: {
    list: (params) => ['branches', 'list', params],
    detail: (id) => ['branches', 'detail', id],
  },
  employees: {
    list: (params) => ['employees', 'list', params],
    detail: (id) => ['employees', 'detail', id],
  },
  shops: {
    list: (params) => ['shops', 'list', params],
    detail: (id) => ['shops', 'detail', id],
  },
}
