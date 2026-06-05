import { api } from './api';

export const AuthService = {
  login: (credentials) => api.post('/auth/login', credentials),
};