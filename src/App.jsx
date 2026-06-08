import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contextos
import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';

import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AdminLayout } from './components/admin/AdminLayout';
import { CustomerLayout } from './components/customer/CustomerLayout';

// Páginas de Clientes (admin)
import { CustomerList } from './pages/admin/CustomerList';
import { CustomerRegistration } from './pages/admin/CustomerRegistration';
import { CustomerEdit } from './pages/admin/CustomerEdit';
import { CustomerDetail } from './pages/admin/CustomerDetail';

// Páginas de Motos
import { MotorcycleList } from './pages/admin/MotorcycleList';
import { MotorcycleRegistration } from './pages/admin/MotorcycleRegistration';
import { MotorcycleEdit } from './pages/admin/MotorcycleEdit';
import { MotorcycleDetail } from './pages/admin/MotorcycleDetail';

// Páginas de Contratos
import { ContractList } from './pages/admin/ContractList';
import { ContractRegistration } from './pages/admin/ContractRegistration';
import { ContractDetail } from './pages/admin/ContractDetail';

// Dashboard e Financeiro
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FinancialDashboard } from './pages/admin/FinancialDashboard';

import { AdminProfile } from './pages/admin/AdminProfile';

// Páginas do cliente (locatário)
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerContracts } from './pages/customer/CustomerContracts';
import { CustomerContractDetail } from './pages/customer/CustomerContractDetail';
import { CustomerMotorcycle } from './pages/customer/CustomerMotorcycle';
import { CustomerProfile } from './pages/customer/CustomerProfile';

function SiteLayout({ children }) {
  const location = useLocation();
  const isSitePage =
    !location.pathname.startsWith('/admin') &&
    !location.pathname.startsWith('/customer') &&
    location.pathname !== '/login';

  return (
    <>
      {isSitePage && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {isSitePage && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      {/* O ConfirmProvider envolve a aplicação para que o Modal funcione em qualquer rota */}
      <ConfirmProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-black-pure">
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: '#050505', color: '#fff', border: '1px solid #1f1f1f' },
                success: { iconTheme: { primary: '#FACC15', secondary: '#000' } },
              }}
            />
            <SiteLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminLayout>
                        <Routes>
                          <Route path="dashboard" element={<AdminDashboard />} />
                          
                          <Route path="clientes" element={<CustomerList />} />
                          <Route path="clientes/novo" element={<CustomerRegistration />} />
                          <Route path="clientes/:id" element={<CustomerDetail />} />
                          <Route path="clientes/:id/editar" element={<CustomerEdit />} />

                          <Route path="perfil" element={<AdminProfile />} />
                          
                          <Route path="motos" element={<MotorcycleList />} />
                          <Route path="motos/nova" element={<MotorcycleRegistration />} />
                          <Route path="motos/:id" element={<MotorcycleDetail />} />
                          <Route path="motos/:id/editar" element={<MotorcycleEdit />} />
                          
                          <Route path="contratos" element={<ContractList />} />
                          <Route path="contratos/novo" element={<ContractRegistration />} />
                          <Route path="contratos/:id" element={<ContractDetail />} />
                          
                          <Route path="financeiro" element={<FinancialDashboard />} />
                          
                          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                        </Routes>
                      </AdminLayout>
                    </ProtectedRoute>
                  } 
                />

                {/* Rotas do cliente (locatário) */}
                <Route
                  path="/customer/*"
                  element={
                    <ProtectedRoute allowedRoles={['CUSTOMER']}>
                      <CustomerLayout>
                        <Routes>
                          <Route path="dashboard" element={<CustomerDashboard />} />
                          <Route path="contratos" element={<CustomerContracts />} />
                          <Route path="contratos/:id" element={<CustomerContractDetail />} />
                          <Route path="moto" element={<CustomerMotorcycle />} />
                          <Route path="perfil" element={<CustomerProfile />} />
                          <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
                        </Routes>
                      </CustomerLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </SiteLayout>
          </div>
        </Router>
      </ConfirmProvider>
    </AuthProvider>
  );
}

export default App;