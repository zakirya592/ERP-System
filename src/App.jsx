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
import AddBranchPage from './pages/Organization/Branches/AddBranchPage.jsx'
import UpdateBranchPage from './pages/Organization/Branches/UpdateBranchPage.jsx'
import BranchPage from './pages/Organization/Branches/BranchPage.jsx'
import ViewBranchPage from './pages/Organization/Branches/ViewBranchPage.jsx'
import AddShopPage from './pages/Organization/Shops/AddShopPage.jsx'
import EditShopPage from './pages/Organization/Shops/EditShopPage.jsx'
import ShopPage from './pages/Organization/Shops/ShopPage.jsx'
import ViewShopPage from './pages/Organization/Shops/ViewShopPage.jsx'
import AddWarehousePage from './pages/Organization/Warehouses/AddWarehousePage.jsx'
import EditWarehousePage from './pages/Organization/Warehouses/EditWarehousePage.jsx'
import ViewWarehousePage from './pages/Organization/Warehouses/ViewWarehousePage.jsx'
import WarehousePage from './pages/Organization/Warehouses/WarehousePage.jsx'
import AddEmployeePage from './pages/Organization/Employees/AddEmployeePage.jsx'
import EditEmployeePage from './pages/Organization/Employees/EditEmployeePage.jsx'
import EmployeePage from './pages/Organization/Employees/EmployeePage.jsx'
import ViewEmployeePage from './pages/Organization/Employees/ViewEmployeePage.jsx'
import AddOwnerPage from './pages/Organization/Owners/AddOwnerPage.jsx'
import EditOwnerPage from './pages/Organization/Owners/EditOwnerPage.jsx'
import OwnerPage from './pages/Organization/Owners/OwnerPage.jsx'
import ViewOwnerPage from './pages/Organization/Owners/ViewOwnerPage.jsx'
import AddCurrencyPage from './pages/MasterData/Currencies/AddCurrencyPage.jsx'
import CurrenciesPage from './pages/MasterData/Currencies/CurrenciesPage.jsx'
import UpdateCurrencyPage from './pages/MasterData/Currencies/UpdateCurrencyPage.jsx'
import ViewCurrencyPage from './pages/MasterData/Currencies/ViewCurrencyPage.jsx'
import AddQuantityUnitPage from './pages/MasterData/QuantityUnits/AddQuantityUnitPage.jsx'
import QuantityUnitsPage from './pages/MasterData/QuantityUnits/QuantityUnitsPage.jsx'
import UpdateQuantityUnitPage from './pages/MasterData/QuantityUnits/UpdateQuantityUnitPage.jsx'
import ViewQuantityUnitPage from './pages/MasterData/QuantityUnits/ViewQuantityUnitPage.jsx'
import AddPackingUnitPage from './pages/MasterData/PackingUnits/AddPackingUnitPage.jsx'
import PackingUnitsPage from './pages/MasterData/PackingUnits/PackingUnitsPage.jsx'
import UpdatePackingUnitPage from './pages/MasterData/PackingUnits/UpdatePackingUnitPage.jsx'
import ViewPackingUnitPage from './pages/MasterData/PackingUnits/ViewPackingUnitPage.jsx'
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
        <Route path="/organization/shop/new" element={<AddShopPage />} />
        <Route path="/organization/shop/:id/edit" element={<EditShopPage />} />
        <Route path="/organization/shop/:id" element={<ViewShopPage />} />
        <Route path="/organization/shop" element={<ShopPage />} />
        <Route path="/organization/warehouses/new" element={<AddWarehousePage />} />
        <Route path="/organization/warehouses/:id/edit" element={<EditWarehousePage />} />
        <Route path="/organization/warehouses/:id" element={<ViewWarehousePage />} />
        <Route path="/organization/warehouses" element={<WarehousePage />} />
        <Route path="/organization/employees/new" element={<AddEmployeePage />} />
        <Route path="/organization/employees/:id/edit" element={<EditEmployeePage />} />
        <Route path="/organization/employees/:id" element={<ViewEmployeePage />} />
        <Route path="/organization/employees" element={<EmployeePage />} />
        <Route path="/organization/owners/new" element={<AddOwnerPage />} />
        <Route path="/organization/owners/:id/edit" element={<EditOwnerPage />} />
        <Route path="/organization/owners/:id" element={<ViewOwnerPage />} />
        <Route path="/organization/owners" element={<OwnerPage />} />
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
        <Route path="/master-data/currency/new" element={<AddCurrencyPage />} />
        <Route path="/master-data/currency/:id/edit" element={<UpdateCurrencyPage />} />
        <Route path="/master-data/currency/:id" element={<ViewCurrencyPage />} />
        <Route path="/master-data/currency" element={<CurrenciesPage />} />
        <Route path="/master-data/units/new" element={<AddQuantityUnitPage />} />
        <Route path="/master-data/units/:id/edit" element={<UpdateQuantityUnitPage />} />
        <Route path="/master-data/units/:id" element={<ViewQuantityUnitPage />} />
        <Route path="/master-data/units" element={<QuantityUnitsPage />} />
        <Route path="/master-data/packing-units/new" element={<AddPackingUnitPage />} />
        <Route path="/master-data/packing-units/:id/edit" element={<UpdatePackingUnitPage />} />
        <Route path="/master-data/packing-units/:id" element={<ViewPackingUnitPage />} />
        <Route path="/master-data/packing-units" element={<PackingUnitsPage />} />
        <Route path=":section/:page" element={<ModulePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
