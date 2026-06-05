import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AdminLayout } from './components/admin/AdminLayout';

// Páginas do CRUD de Clientes
import { CustomerList } from './pages/admin/CustomerList';
import { CustomerRegistration } from './pages/admin/CustomerRegistration';
import { CustomerEdit } from './pages/admin/CustomerEdit';

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
      <Router>
        <div className="flex flex-col min-h-screen bg-black-pure">
          <SiteLayout>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              {/* Rotas Privadas do Administrador */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout>
                      <Routes>
                        <Route path="dashboard" element={<div className="text-white text-2xl font-bold">Visão Geral (Em breve)</div>} />
                        
                        {/* CRUD de Locatários */}
                        <Route path="clientes" element={<CustomerList />} />
                        <Route path="clientes/novo" element={<CustomerRegistration />} />
                        {/* Nova Rota para Atualizar Utilizadores */}
                        <Route path="clientes/:id/editar" element={<CustomerEdit />} />
                        
                        <Route path="motos" element={<div className="text-white">Frota (Em breve)</div>} />
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
    </AuthProvider>
  );
}

export default App;