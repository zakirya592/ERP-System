import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/Login/LoginPage.jsx'
import AddCustomerPage from './pages/Customer/AddCustomerPage.jsx'
import CustomerPage from './pages/Customer/CustomerPage.jsx'
import AddProductPage from './pages/ProductsInventory/products/AddProductPage.jsx'
import CategoryPage from './pages/ProductsInventory/categories/CategoryPage.jsx'
import ProductPage from './pages/ProductsInventory/products/ProductPage.jsx'
import NewSalePage from './pages/Sales/NewSalePage.jsx'
import SalesPage from './pages/Sales/SalesPage.jsx'
import SalesReturnPage from './pages/Sales/SalesReturnPage.jsx'
import AddSupplierPage from './pages/Supplier/AddSupplierPage.jsx'
import SupplierPage from './pages/Supplier/SupplierPage.jsx'
import AddUserPage from './pages/UsersAndSecurity/Users/AddUserPage.jsx'
import PermissionsPage from './pages/UsersAndSecurity/permissions/PermissionsPage.jsx'
import AddRolePage from './pages/UsersAndSecurity/Roles/AddRolePage.jsx'
import RolesPage from './pages/UsersAndSecurity/Roles/RolesPage.jsx'
import UpdateRolePage from './pages/UsersAndSecurity/Roles/UpdateRolePage.jsx'
import ViewRolePage from './pages/UsersAndSecurity/Roles/ViewRolePage.jsx'
import UpdateUserPage from './pages/UsersAndSecurity/Users/UpdateUserPage.jsx'
import UsersPage from './pages/UsersAndSecurity/Users/UsersPage.jsx'
import ViewUserPage from './pages/UsersAndSecurity/Users/ViewUserPage.jsx'
import AddBranchPage from './pages/Organization/AddBranchPage.jsx'
import UpdateBranchPage from './pages/Organization/UpdateBranchPage.jsx'
import BranchPage from './pages/Organization/BranchPage.jsx'
import ViewBranchPage from './pages/Organization/ViewBranchPage.jsx'
import ModulePage from './pages/ModulePage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/organization/branches" element={<BranchPage />} />
        <Route path="/organization/branches/new" element={<AddBranchPage />} />
        <Route path="/organization/branches/:id/edit" element={<UpdateBranchPage />} />
        <Route path="/organization/branches/:id" element={<ViewBranchPage />} />
        <Route path="/sales/sales" element={<SalesPage />} />
        <Route path="/sales/sales/new" element={<NewSalePage />} />
        <Route path="/sales/returns" element={<SalesReturnPage />} />
        <Route path="/sales/customers" element={<CustomerPage />} />
        <Route path="/sales/customers/new" element={<AddCustomerPage />} />
        <Route path="/purchases/suppliers" element={<SupplierPage />} />
        <Route path="/purchases/suppliers/new" element={<AddSupplierPage />} />
        <Route path="/products/products" element={<ProductPage />} />
        <Route path="/products/products/new" element={<AddProductPage />} />
        <Route path="/products/categories" element={<CategoryPage />} />
        <Route path="/users/users" element={<UsersPage />} />
        <Route path="/users/users/new" element={<AddUserPage />} />
        <Route path="/users/users/:id/edit" element={<UpdateUserPage />} />
        <Route path="/users/users/:id" element={<ViewUserPage />} />
        <Route path="/users/roles" element={<RolesPage />} />
        <Route path="/users/roles/new" element={<AddRolePage />} />
        <Route path="/users/roles/:id" element={<ViewRolePage />} />
        <Route path="/users/roles/:id/edit" element={<UpdateRolePage />} />
        <Route path="/users/permissions" element={<PermissionsPage />} />
        <Route path=":section/:page" element={<ModulePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
