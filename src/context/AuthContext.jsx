import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('@SaquaLocamotos:token');
    const storedUser = localStorage.getItem('@SaquaLocamotos:user');

    // A PROTEÇÃO: Verifica se o token existe e se o usuário não é a palavra "undefined"
    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erro ao ler os dados do usuário:", error);
        // Se der erro, limpa os dados sujos para não travar a aplicação
        localStorage.removeItem('@SaquaLocamotos:token');
        localStorage.removeItem('@SaquaLocamotos:user');
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    // Faz a chamada para a API
    const response = await api.post('/auth/login', { email, password });
    
    // Pega APENAS o token, conforme o seu LoginResponseDto
    const token = response.data.token;
    
    // Como o backend ainda não retorna o Perfil e Nome, vamos simular os dados
    // do usuário aqui no front para o Painel Administrativo liberar o acesso.
    const userData = { 
      email: email, 
      role: 'ADMIN', // Forçando admin para testarmos o Dashboard
      name: 'Administrador' 
    }; 

    // Salva o token real e o usuário simulado no navegador
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