import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://saqualocamotosbackend-m0ge32fj.b4a.run/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@SaquaLocamotos:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});