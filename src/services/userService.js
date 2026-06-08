import { api } from './api';

export const UserService = {
  // GET
  getAllCustomers: () => api.get('/users/customers/all'),
  getUserById: (id) => api.get(`/users/${id}`),
  getCustomerById: (id) => api.get(`/users/${id}`),
  
  // POST / PUT
  createCustomer: (data) => api.post('/users/customer/create', data),
  updateProfile: (data) => api.put('/users/update', data),
  updateCustomer: (data) => api.put('/users/update', data),
  updatePassword: (data) => api.patch('/users/update-password', data),
  sendVerificationEmail: (id) => api.post(`/users/${id}/send-verification-email`),
  verifyEmailToken: (token) => api.get('/users/verify-email', { params: { token } }),
  
  // Uploads
  uploadPicture: (id, formData) => api.post(`/users/${id}/upload-picture`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Documentos
  uploadDocuments: (id, formData) => api.post(`/users/${id}/upload-documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  deleteDocuments: (id, types) => {
    // O backend espera ?types=cnh&types=rg...
    const params = new URLSearchParams();
    types.forEach(type => params.append('types', type));
    
    return api.delete(`/users/${id}/delete-documents`, { params });
  }
};