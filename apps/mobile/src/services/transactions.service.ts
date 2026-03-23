import { api } from './api.service';

export const transactionsService = {
  getAll: (params?: {
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/transactions', { params }).then(r => r.data),

  getMonthlySummary: (year?: number, month?: number) =>
    api.get('/transactions/summary', { params: { year, month } }).then(r => r.data),

  create: (data: {
    title: string;
    amount: number;
    type: string;
    category: string;
    date?: string;
    notes?: string;
  }) => api.post('/transactions', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/transactions/${id}`, data).then(r => r.data),

  delete: (id: string) => api.delete(`/transactions/${id}`).then(r => r.data),
};
