import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Contextos
import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';

import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AdminLayout } from './components/admin/AdminLayout';

// Páginas de Clientes
import { CustomerList } from './pages/admin/CustomerList';
import { CustomerRegistration } from './pages/admin/CustomerRegistration';
import { CustomerEdit } from './pages/admin/CustomerEdit';

// Páginas de Motos
import { MotorcycleList } from './pages/admin/MotorcycleList';
import { MotorcycleRegistration } from './pages/admin/MotorcycleRegistration';

function SiteLayout({ children }) {
  const location = useLocation();
  const isSitePage = !location.pathname.startsWith('/admin') && location.pathname !== '/login';

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
                          <Route path="dashboard" element={<div className="text-white text-2xl font-bold">Visão Geral (Em breve)</div>} />
                          
                          <Route path="clientes" element={<CustomerList />} />
                          <Route path="clientes/novo" element={<CustomerRegistration />} />
                          <Route path="clientes/:id/editar" element={<CustomerEdit />} />
                          
                          <Route path="motos" element={<MotorcycleList />} />
                          <Route path="motos/nova" element={<MotorcycleRegistration />} />
                          
                          <Route path="contratos" element={<div className="text-white">Contratos (Em breve)</div>} />
                          <Route path="financeiro" element={<div className="text-white">Financeiro (Em breve)</div>} />
                          
                          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                        </Routes>
                      </AdminLayout>
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