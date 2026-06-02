import axios from 'axios';
import { API_URL } from '@env';
import { tokenStorage } from '../storage';
import { useAuthStore } from '../auth/store/useAuthStore';

export const api = axios.create({
  baseURL: API_URL || 'http://10.0.2.2:3333',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
