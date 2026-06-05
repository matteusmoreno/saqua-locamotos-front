import axios from 'axios';

export const api = axios.create({
  // Atualizado para a porta correta do seu backend Quarkus
  baseURL: 'http://localhost:9292', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Toda vez que o Axios fizer uma requisição, ele injeta o Token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@SaquaLocamotos:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});