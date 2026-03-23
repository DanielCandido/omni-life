import { api } from './api.service';

export const mealsService = {
  getAll: (params?: { date?: string; type?: string }) =>
    api.get('/meals', { params }).then(r => r.data),

  getDailyNutrition: (date?: string) =>
    api.get('/meals/nutrition', { params: { date } }).then(r => r.data),

  create: (data: {
    name: string;
    type: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    loggedAt?: string;
  }) => api.post('/meals', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/meals/${id}`, data).then(r => r.data),

  delete: (id: string) => api.delete(`/meals/${id}`).then(r => r.data),
};
