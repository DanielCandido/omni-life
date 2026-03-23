import { api } from './api.service';

export const tasksService = {
  getAll: (params?: { status?: string; date?: string }) =>
    api.get('/tasks', { params }).then(r => r.data),

  getOne: (id: string) => api.get(`/tasks/${id}`).then(r => r.data),

  create: (data: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    points?: number;
  }) => api.post('/tasks', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/tasks/${id}`, data).then(r => r.data),

  complete: (id: string) => api.patch(`/tasks/${id}/complete`).then(r => r.data),

  delete: (id: string) => api.delete(`/tasks/${id}`).then(r => r.data),

  getDailyStats: (date?: string) =>
    api.get('/tasks/stats', { params: { date } }).then(r => r.data),
};
