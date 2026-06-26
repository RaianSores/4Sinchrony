import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Role } from '../../types/role';
import type { User } from '../../types/user';
import { tokenStorage } from '../../storage';
import { usePackageStore } from '../../../domains/student/purchases/store/usePackageStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialized: boolean;
  activeRole: Role;
  availableRoles: Role[];

  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setTokens: (token: string, refreshToken: string) => void;
  switchRole: (role: Role) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      initialized: false,
      activeRole: 'student',
      availableRoles: ['student'],

      login: (user, token, refreshToken) => {
        tokenStorage.setToken(token);
        tokenStorage.setRefreshToken(refreshToken);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          activeRole: user.role,
          availableRoles: [user.role],
        });
      },

      logout: async () => {
        // importação lazy para evitar circular dependency
        const { authService } = await import('../services/authService');
        await authService.logout();
        tokenStorage.clear();
        usePackageStore.getState().clearPurchases();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          activeRole: 'student',
          availableRoles: ['student'],
        });
      },

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setTokens: (token, refreshToken) => {
        tokenStorage.setToken(token);
        tokenStorage.setRefreshToken(refreshToken);
        set({ token });
      },

      switchRole: (role) =>
        set((state) => {
          if (!state.availableRoles.includes(role)) return state;
          return { activeRole: role };
        }),

      initialize: async () => {
        const storedToken = tokenStorage.getToken();
        if (!storedToken) {
          set({ initialized: true, isAuthenticated: false });
          return;
        }
        try {
          const { authService } = await import('../services/authService');
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, initialized: true });
        } catch {
          // token inválido ou expirado — limpar sessão
          tokenStorage.clear();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            initialized: true,
            activeRole: 'student',
            availableRoles: ['student'],
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        activeRole: state.activeRole,
        availableRoles: state.availableRoles,
      }),
    }
  )
);
