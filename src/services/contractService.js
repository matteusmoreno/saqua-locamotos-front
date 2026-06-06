import { api } from './api';

export const ContractService = {
  // GET
  getAllContracts: () => api.get('/contracts/all'),
  getContractById: (id) => api.get(`/contracts/${id}`),
  
  // POST
  createContract: (data) => api.post('/contracts/create', data),
  
  // PATCH (Status)
  finishContract: (id, refundDeposit) => api.patch(`/contracts/${id}/finish?refundDeposit=${refundDeposit}`),
  cancelContract: (id) => api.patch(`/contracts/${id}/cancel`),
  
  // Arquivos e PDF
  generatePdf: (id) => api.get(`/contracts/${id}/generate-pdf`, {
    responseType: 'blob', // Essencial para baixar o PDF corretamente
  }),
  
  uploadFile: (id, formData) => api.post(`/contracts/${id}/upload-file`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};