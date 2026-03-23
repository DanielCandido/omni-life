import { create } from 'zustand';
import { tasksService } from '../services/tasks.service';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
  points: number;
  createdAt: string;
}

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  fetchTasks: (params?: { status?: string; date?: string }) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await tasksService.getAll(params);
      set({ tasks });
    } catch (error: any) {
      set({ error: error?.response?.data?.message || 'Failed to fetch tasks' });
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const task = await tasksService.create(data as any);
      set({ tasks: [task, ...get().tasks] });
    } catch (error: any) {
      set({ error: error?.response?.data?.message || 'Failed to create task' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTask: async (id, data) => {
    try {
      const updated = await tasksService.update(id, data as any);
      set({
        tasks: get().tasks.map(t => (t.id === id ? updated : t)),
      });
    } catch (error: any) {
      set({ error: error?.response?.data?.message || 'Failed to update task' });
      throw error;
    }
  },

  completeTask: async (id) => {
    try {
      const completed = await tasksService.complete(id);
      set({
        tasks: get().tasks.map(t => (t.id === id ? completed : t)),
      });
    } catch (error: any) {
      set({ error: error?.response?.data?.message || 'Failed to complete task' });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await tasksService.delete(id);
      set({ tasks: get().tasks.filter(t => t.id !== id) });
    } catch (error: any) {
      set({ error: error?.response?.data?.message || 'Failed to delete task' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
