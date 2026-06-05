import { api } from './api';

export const UserService = {
  // GET
  getAllCustomers: () => api.get('/users/customers/all'),
  getCustomerById: (id) => api.get(`/users/${id}`),
  
  // POST / PUT
  createCustomer: (data) => api.post('/users/customer/create', data),
  updateCustomer: (data) => api.put('/users/update', data),
  
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