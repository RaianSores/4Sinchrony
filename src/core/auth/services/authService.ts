import axios from 'axios';
import { env } from '../../../config/env';
import { api } from '../../http/api';
import { tokenStorage } from '../../storage';
import { captureError } from '../../../lib/sentry';
import { LoginCredentials, RegisterData, AuthResponse } from '../types';

// Instância separada para evitar loop circular com o interceptor de refresh
const authApi = axios.create({
  baseURL: env.API_URL || 'http://10.0.2.2:3333',
  timeout: 10000,
});

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      const token = await tokenStorage.getToken();
      if (token) {
        await authApi.post('/auth/logout', null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      captureError(error);
    }
  },

  async refreshToken(): Promise<{ token: string; refresh_token: string }> {
    const refreshToken = await tokenStorage.getRefreshToken();
    const res = await authApi.post<{ token: string; access_token: string; refresh_token: string }>(
      '/auth/refresh',
      { refresh_token: refreshToken },
    );
    return {
      token: res.data.token ?? res.data.access_token,
      refresh_token: res.data.refresh_token,
    };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },

  async getMe(): Promise<AuthResponse['user']> {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
