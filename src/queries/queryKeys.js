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
  },
}
