import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/Login/LoginPage.jsx'
import AddCustomerPage from './pages/Customer/AddCustomerPage.jsx'
import CustomerPage from './pages/Customer/CustomerPage.jsx'
import AddSupplierPage from './pages/Supplier/AddSupplierPage.jsx'
import SupplierPage from './pages/Supplier/SupplierPage.jsx'
import ModulePage from './pages/ModulePage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sales/customers" element={<CustomerPage />} />
        <Route path="/sales/customers/new" element={<AddCustomerPage />} />
        <Route path="/purchases/suppliers" element={<SupplierPage />} />
        <Route path="/purchases/suppliers/new" element={<AddSupplierPage />} />
        <Route path=":section/:page" element={<ModulePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
