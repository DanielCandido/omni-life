import { api } from './api.service';

export const scoringService = {
  getTodayScore: () => api.get('/scoring/today').then(r => r.data),
  getWeeklySummary: () => api.get('/scoring/weekly').then(r => r.data),
  getHistory: (limit?: number) =>
    api.get('/scoring/history', { params: { limit } }).then(r => r.data),
  getLeaderboard: (limit?: number) =>
    api.get('/scoring/leaderboard', { params: { limit } }).then(r => r.data),
};
