import axios from 'axios';
import { api } from '../../http/api';
import { API_BASE_URL, API_TIMEOUT } from '../../http/config';
import { tokenStorage } from '../../storage';
import { captureError } from '../../../lib/sentry';
import { LoginCredentials, RegisterData, AuthResponse } from '../types';

// `authApi` is a deliberately separate axios instance sharing `api`'s config (see
// core/http/config.ts) but NOT its interceptors. `api`'s response interceptor calls
// authService.refreshToken()/logout() on 401 — if those calls went through `api` itself,
// a 401 on the refresh/logout call would re-trigger the same interceptor recursively.
// Do not merge this into `api` (confirmed intentional in a prior audit pass, B-005).
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

// The real API replies in camelCase (accessToken/refreshToken/tokenType/expiresIn), not the
// snake_case AuthResponse.refresh_token this app expects — confirmed live against
// https://sinchrony.onrender.com 2026-07-02. This silently broke refresh-token capture on
// every login (refresh_token was always undefined), forcing a full re-login every ~15min
// (expiresIn: 900) once the access token expired. Normalize both casings defensively.
interface RawAuthResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: AuthResponse['user'];
}

function normalizeAuthResponse(raw: RawAuthResponse): AuthResponse {
  return {
    user: raw.user!,
    token: raw.token ?? raw.accessToken ?? raw.access_token ?? '',
    refresh_token: raw.refreshToken ?? raw.refresh_token ?? '',
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await api.post<RawAuthResponse>('/auth/login', credentials);
    return normalizeAuthResponse(res.data);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await api.post<RawAuthResponse>('/auth/register', data);
    return normalizeAuthResponse(res.data);
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
    const res = await authApi.post<RawAuthResponse>(
      '/auth/refresh',
      { refresh_token: refreshToken },
    );
    return {
      token: res.data.token ?? res.data.accessToken ?? res.data.access_token ?? '',
      refresh_token: res.data.refreshToken ?? res.data.refresh_token ?? '',
    };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  // Achado crítico 21/07/2026: ResetPasswordScreen chamava `changePassword(newPassword,
  // newPassword)` — o endpoint AUTENTICADO (`PUT /auth/change-password`), nunca usando o
  // `token` do link de email. Quem chega nessa tela não tem sessão válida, então essa
  // chamada sempre dava 401, mascarado por uma mensagem plausível mas errada ("token
  // inválido/expirado" — o token nunca era sequer enviado). Confirmado ao vivo: `POST
  // /auth/reset-password` com token é o endpoint correto (resposta distinta, 422 "Token
  // inválido" para token inexistente, diferente do 401 do endpoint autenticado).
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    const res = await api.post('/auth/reset-password', { token, newPassword });
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
