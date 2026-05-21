import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.API_URL || 'http://10.0.2.2:3333',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  try {
    const raw = require('@react-native-async-storage/async-storage').default;
    raw.getItem('auth-storage').then((value: string | null) => {
      if (value) {
        const parsed = JSON.parse(value);
        const token = parsed?.state?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    });
    } catch {}
  return config;
});
