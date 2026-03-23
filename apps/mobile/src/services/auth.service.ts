import { api } from './api.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials).then(r => r.data),

  register: (credentials: RegisterCredentials) =>
    api.post<AuthResponse>('/auth/register', credentials).then(r => r.data),

  logout: () => api.post('/auth/logout').then(r => r.data),

  socialLogin: (provider: string, token: string, email?: string, name?: string, avatarUrl?: string) =>
    api.post<AuthResponse>('/auth/social', { provider, token, email, name, avatarUrl }).then(r => r.data),
};
