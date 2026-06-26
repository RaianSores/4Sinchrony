import type { Role } from '../types/role';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
    credits?: number;
  };
  token: string;
  refresh_token: string;
}
