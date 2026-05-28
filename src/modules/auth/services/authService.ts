import { LoginCredentials, RegisterData, AuthResponse } from '../types';
import { User } from '../../../shared/types';

// Simulação de delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800);

    // Mock de usuário
    const user: User = {
      id: 'user_123',
      name: 'Raian Soares',
      email: credentials.email,
      avatar: 'https://i.pravatar.cc/300',
      credits: 12,
    };

    const token = 'mock-jwt-token-123456';

    return { user, token };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    await delay(1000);

    const user: User = {
      id: 'user_' + Date.now(),
      name: data.name,
      email: data.email,
      avatar: 'https://i.pravatar.cc/300',
      credits: 0,
    };

    const token = 'mock-jwt-token-123456';
    return { user, token };
  },

  async forgotPassword(_email: string): Promise<{ success: boolean; message: string }> {
    await delay(700);
    return {
      success: true,
      message: 'Link de recuperação enviado para seu email.'
    };
  },
};