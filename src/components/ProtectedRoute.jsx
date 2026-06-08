import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { signed, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black-pure flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!signed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // CUSTOMER tentando acessar rota de ADMIN → redireciona para área do cliente
    if (user?.role === 'CUSTOMER') {
      return <Navigate to="/customer/dashboard" replace />;
    }
    // ADMIN tentando rota exclusiva de CUSTOMER (improvável, mas seguro)
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}