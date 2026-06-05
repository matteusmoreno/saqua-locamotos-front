import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { signed, user, loading } = useAuth();
  const location = useLocation();

  // Enquanto estiver verificando o token, mostra um loading giratório
  if (loading) {
    return (
      <div className="min-h-screen bg-black-pure flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se não estiver logado (signed = false), joga de volta pra tela de login
  if (!signed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se a rota exige um perfil específico (ex: ADMIN) e o usuário não for, joga pra Home
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // Se passou em tudo, renderiza a tela que o usuário pediu
  return children;
}