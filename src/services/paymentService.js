import { api } from './api';

export const PaymentService = {
  // GET
  getPaymentById: (id) => api.get(`/payments/${id}`),
  getPaymentsByContract: (contractId) => api.get(`/payments/contract/${contractId}`),

  // POST
  createPayment: (data) => api.post('/payments/create', data),

  // PATCH
  registerPayment: (data) => api.patch('/payments/register', data),

  // DELETE
  deletePayment: (id) => api.delete(`/payments/${id}`),
};
