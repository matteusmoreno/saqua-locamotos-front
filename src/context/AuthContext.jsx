import { createContext, useState, useEffect, useContext } from 'react';
import { AuthService } from '../services/authService';

const AuthContext = createContext({
  signed: false,
  user: null,
  loading: true,
  isAdmin: false,
  isCustomer: false,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
});

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (nextUser) => {
    localStorage.setItem('@SaquaLocamotos:user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('@SaquaLocamotos:token');
    const storedUserRaw = localStorage.getItem('@SaquaLocamotos:user');
    
    if (storedToken) {
      const decoded = decodeJWT(storedToken);
      if (decoded) {
        // Extraímos os dados diretamente do token
        const tokenUser = {
          id: decoded.userId,
          name: decoded.name,
          email: decoded.upn, // ou decoded.email se o seu JWT fornecer
          role: decoded.groups?.[0] || 'ADMIN'
        };

        try {
          const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
          if (storedUser) {
            setUser({ ...tokenUser, ...storedUser, id: tokenUser.id, role: tokenUser.role });
          } else {
            setUser(tokenUser);
          }
        } catch (error) {
          console.error('Erro ao ler utilizador salvo:', error);
          setUser(tokenUser);
        }
      } else {
        // Token inválido ou expirado
        localStorage.removeItem('@SaquaLocamotos:token');
        localStorage.removeItem('@SaquaLocamotos:user');
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    const response = await AuthService.login({ email, password });
    const token = response.data.token;
    
    // Decodifica o token recebido no login
    const decoded = decodeJWT(token);
    
    const userData = { 
      id: decoded.userId,
      name: decoded.name,
      email: decoded.upn,
      role: decoded.groups?.[0] || 'ADMIN'
    }; 

    localStorage.setItem('@SaquaLocamotos:token', token);
    // Armazenar o objeto decodificado garante que o nome estará lá
    localStorage.setItem('@SaquaLocamotos:user', JSON.stringify(userData));

    persistUser(userData);
    return userData;
  };

  const updateUser = (dataOrUpdater) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const nextUser = typeof dataOrUpdater === 'function'
        ? dataOrUpdater(currentUser)
        : { ...currentUser, ...dataOrUpdater };

      localStorage.setItem('@SaquaLocamotos:user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const logout = () => {
    localStorage.removeItem('@SaquaLocamotos:token');
    localStorage.removeItem('@SaquaLocamotos:user');
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, login, logout, updateUser, isAdmin, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}