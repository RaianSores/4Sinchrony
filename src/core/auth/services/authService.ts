import { LoginCredentials, RegisterData, AuthResponse } from '../types';
import type { User } from '../../types/user';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800);

    const user: User = {
      id: 'user_123',
      name: 'Aluno Demo',
      email: credentials.email,
      role: 'student',
      avatar: 'https://i.pravatar.cc/150?u=student',
      credits: 0,
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
      role: 'student',
      avatar: 'https://i.pravatar.cc/150?u=' + Date.now(),
      credits: 0,
    };

    const token = 'mock-jwt-token-123456';
    return { user, token };
  },

  async forgotPassword(_email: string): Promise<{ success: boolean; message: string }> {
    await delay(700);
    return {
      success: true,
      message: 'Link de recuperação enviado para seu email.',
    };
  },

  async loginAsTeacher(): Promise<AuthResponse> {
    await delay(800);

    const user: User = {
      id: 'teacher_456',
      name: 'Prof. Ádria',
      email: 'adria@studiowellness.com',
      role: 'teacher',
      avatar: 'https://i.pravatar.cc/150?u=adria',
    };

    const token = 'mock-jwt-token-teacher-789';

    return { user, token };
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    await delay(600);
    if (!currentPassword || !newPassword) {
      throw new Error('Preencha todos os campos');
    }
    if (newPassword.length < 6) {
      throw new Error('Nova senha deve ter pelo menos 6 caracteres');
    }
    return { success: true, message: 'Senha alterada com sucesso' };
  },

  async loginAsAdmin(): Promise<AuthResponse> {
    await delay(800);

    const user: User = {
      id: 'admin_789',
      name: 'Admin Studio',
      email: 'admin@studiowellness.com',
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?u=admin',
    };

    const token = 'mock-jwt-token-admin-000';

    return { user, token };
  },
};
