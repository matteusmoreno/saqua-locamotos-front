import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: 'https://saqualocamotos.qzz.io/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@SaquaLocamotos:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      toast.error('Acesso negado. Você não tem permissão para acessar essa informação.');
    }
    return Promise.reject(error);
  }
);