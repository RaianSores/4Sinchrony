import { api } from '../../http/api';
import { tokenStorage } from '../../storage';
import { LoginCredentials, RegisterData, AuthResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    tokenStorage.setToken(res.data.token);
    return res.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    tokenStorage.setToken(res.data.token);
    return res.data;
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

  async loginAsTeacher(): Promise<AuthResponse> {
    return authService.login({ email: 'teacher@studio.com', password: 'teacher123' });
  },

  async loginAsAdmin(): Promise<AuthResponse> {
    return authService.login({ email: 'admin@studio.com', password: 'admin123' });
  },
};
