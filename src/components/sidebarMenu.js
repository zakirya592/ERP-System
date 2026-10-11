import {
  BarChart3,
  Building2,
  Calculator,
  Database,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Wallet,
} from 'lucide-react'

export const sidebarMenu = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    key: 'organization',
    label: 'Organization',
    icon: Building2,
    children: [
      { key: 'branches', label: 'Branches', to: '/organization/branches' },
      { key: 'departments', label: 'Departments', to: '/organization/departments' },
      { key: 'warehouses', label: 'Warehouses', to: '/organization/warehouses' },
    ],
  },
  {
    key: 'products',
    label: 'Products & Inventory',
    icon: Package,
    children: [
      { key: 'categories', label: 'Categories', to: '/products/categories' },
      { key: 'stock', label: 'Stock', to: '/products/stock' },
      { key: 'movements', label: 'Stock Movements', to: '/products/movements' },
      { key: 'transfers', label: 'Transfers', to: '/products/transfers' },
      { key: 'adjustments', label: 'Adjustments', to: '/products/adjustments' },
      { key: 'damage', label: 'Product Damage', to: '/products/damage' },
    ],
  },
  {
    key: 'sales',
    label: 'Sales',
    icon: ShoppingCart,
    children: [
      { key: 'orders', label: 'Orders', to: '/sales/orders' },
      { key: 'invoices', label: 'Invoices', to: '/sales/invoices' },
      { key: 'customers', label: 'Customers', to: '/sales/customers' },
    ],
  },
  {
    key: 'purchases',
    label: 'Purchases',
    icon: ShoppingBag,
    children: [
      { key: 'orders', label: 'Purchase Orders', to: '/purchases/orders' },
      { key: 'suppliers', label: 'Suppliers', to: '/purchases/suppliers' },
    ],
  },
  {
    key: 'payments',
    label: 'Payments & Receipts',
    icon: Wallet,
    children: [
      { key: 'payments', label: 'Payments', to: '/payments/payments' },
      { key: 'receipts', label: 'Receipts', to: '/payments/receipts' },
    ],
  },
  {
    key: 'accounting',
    label: 'Accounting',
    icon: Calculator,
    children: [
      { key: 'accounts', label: 'Chart of Accounts', to: '/accounting/accounts' },
      { key: 'journals', label: 'Journals', to: '/accounting/journals' },
    ],
  },
  {
    key: 'logistics',
    label: 'Logistics',
    icon: Truck,
    children: [
      { key: 'shipments', label: 'Shipments', to: '/logistics/shipments' },
      { key: 'carriers', label: 'Carriers', to: '/logistics/carriers' },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: BarChart3,
    children: [
      { key: 'sales', label: 'Sales Reports', to: '/reports/sales' },
      { key: 'inventory', label: 'Inventory Reports', to: '/reports/inventory' },
    ],
  },
  {
    key: 'master-data',
    label: 'Master Data',
    icon: Database,
    children: [
      { key: 'units', label: 'Units', to: '/master-data/units' },
      { key: 'taxes', label: 'Taxes', to: '/master-data/taxes' },
    ],
  },
  {
    key: 'users',
    label: 'Users & Security',
    icon: Shield,
    children: [
      { key: 'users', label: 'Users', to: '/users/users' },
      { key: 'roles', label: 'Roles', to: '/users/roles' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    children: [
      { key: 'general', label: 'General', to: '/settings/general' },
      { key: 'preferences', label: 'Preferences', to: '/settings/preferences' },
    ],
  },
]
