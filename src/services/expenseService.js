import { api } from './api';

export const ExpenseService = {
  // GET
  getExpenseById: (id) => api.get(`/expenses/${id}`),

  // POST
  createExpense: (data) => api.post('/expenses/create', data),

  // PATCH
  registerExpense: (data) => api.patch('/expenses/register', data),

  // DELETE
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
};
