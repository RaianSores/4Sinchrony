import type { Role } from '../types/role';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean;
    cpf?: string;
    role: Role;
    avatar?: string;
    credits?: number;
    // Dependente (pacote família): acesso limitado no perfil. Depende do backend expor.
    isDependent?: boolean;
    responsibleStudentId?: string | null;
  };
  token: string;
  refresh_token: string;
}

export interface VerifyEmailData {
  email: string;
}

export interface VerifyEmailResponse {
  message: string;
  success: boolean;
}

export interface ResendVerificationData {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}
