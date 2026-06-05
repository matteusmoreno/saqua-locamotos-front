import { api } from './api';

export const MotorcycleService = {
  // GET
  getAllMotorcycles: () => api.get('/motorcycles/all'),
  getAvailableMotorcycles: () => api.get('/motorcycles/all/available'),
  getMotorcycleById: (id) => api.get(`/motorcycles/${id}`),
  getMotorcycleContracts: (id) => api.get(`/motorcycles/${id}/contracts`),
  
  // POST / PUT
  createMotorcycle: (data) => api.post('/motorcycles/create', data),
  updateMotorcycle: (data) => api.put('/motorcycles/update', data),
  
  // PATCH (Enable/Disable)
  enableMotorcycle: (id) => api.patch(`/motorcycles/${id}/enable`),
  disableMotorcycle: (id) => api.patch(`/motorcycles/${id}/disable`),
  
  // Uploads & Documents
  uploadPicture: (id, formData) => api.post(`/motorcycles/${id}/upload-picture`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePicture: (id) => api.delete(`/motorcycles/${id}/delete-picture`),
  
  uploadDocument: (id, formData) => api.post(`/motorcycles/${id}/upload-document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument: (id) => api.delete(`/motorcycles/${id}/delete-document`),
};