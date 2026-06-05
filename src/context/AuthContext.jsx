import { createContext, useState, useEffect, useContext } from 'react';
import { AuthService } from '../services/authService';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('@SaquaLocamotos:token');
    const storedUser = localStorage.getItem('@SaquaLocamotos:user');

    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erro ao ler os dados do usuário:", error);
        localStorage.removeItem('@SaquaLocamotos:token');
        localStorage.removeItem('@SaquaLocamotos:user');
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    // UTILIZANDO O SERVIÇO DE AUTH
    const response = await AuthService.login({ email, password });
    
    const token = response.data.token;
    
    const userData = { 
      email: email, 
      role: 'ADMIN', 
      name: 'Administrador' 
    }; 

    localStorage.setItem('@SaquaLocamotos:token', token);
    localStorage.setItem('@SaquaLocamotos:user', JSON.stringify(userData));

    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('@SaquaLocamotos:token');
    localStorage.removeItem('@SaquaLocamotos:user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}