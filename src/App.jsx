import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';

// Tela provisória do Painel Admin (vamos construí-la de verdade no próximo passo)
function AdminDashboardMock() {
  return (
    <div className="pt-32 p-10 text-white bg-black-pure min-h-screen">
      <h1 className="text-4xl font-bold text-brand-gold mb-4">Painel Geral do Administrador</h1>
      <p className="text-gray-400">Autenticação realizada com sucesso! API do Quarkus conectada.</p>
    </div>
  );
}

// Componente que esconde o Header/Footer na tela de Login
function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname.startsWith('/admin');

  return (
    <>
      {!isAuthPage && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-black-pure">
          <Layout>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              {/* Rota Privada do Administrador (Protegida) */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardMock />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Layout>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;