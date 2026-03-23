import { create } from 'zustand';
import { tokenStorage } from '../services/api.service';
import { authService } from '../services/auth.service';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  socialLogin: (provider: string, token: string, email?: string, name?: string, avatarUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        // Try to get user profile
        const { api } = await import('../services/api.service');
        const response = await api.get('/users/me');
        set({ user: response.data, isAuthenticated: true });
      }
    } catch {
      await tokenStorage.clearTokens();
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      await tokenStorage.setTokens(response.accessToken, response.refreshToken);
      set({ user: response.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error?.response?.data?.message || 'Login failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register({ name, email, password });
      await tokenStorage.setTokens(response.accessToken, response.refreshToken);
      set({ user: response.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error?.response?.data?.message || 'Registration failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  socialLogin: async (provider, token, email, name, avatarUrl) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.socialLogin(provider, token, email, name, avatarUrl);
      await tokenStorage.setTokens(response.accessToken, response.refreshToken);
      set({ user: response.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error?.response?.data?.message || 'Social login failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      await tokenStorage.clearTokens();
      set({ user: null, isAuthenticated: false });
    }
  },

  setUser: user => set({ user }),

  clearError: () => set({ error: null }),
}));
