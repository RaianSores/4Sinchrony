import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Role } from '../../types/role';
import type { User } from '../../types/user';
import { tokenStorage } from '../../storage';
import { usePackageStore } from '../../../domains/student/purchases/store/usePackageStore';
import { captureError } from '../../../lib/sentry';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialized: boolean;
  activeRole: Role;
  availableRoles: Role[];

  login: (user: User, token: string, refreshToken: string) => Promise<void>;
  logout: (skipServerCall?: boolean) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setTokens: (token: string, refreshToken: string) => Promise<void>;
  switchRole: (role: Role) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      initialized: false,
      activeRole: 'student',
      availableRoles: ['student'],

      login: async (user, token, refreshToken) => {
        await tokenStorage.setToken(token);
        await tokenStorage.setRefreshToken(refreshToken);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          activeRole: user.role,
          availableRoles: [user.role],
        });
      },

      logout: async (skipServerCall = false) => {
        if (!skipServerCall) {
          const { authService } = await import('../services/authService');
          await authService.logout();
        }
        await tokenStorage.clear();
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

      refreshUser: async () => {
        try {
          const { authService } = await import('../services/authService');
          const user = await authService.getMe();
          set({ user });
        } catch (error) {
          captureError(error);
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setTokens: async (token, refreshToken) => {
        await tokenStorage.setToken(token);
        await tokenStorage.setRefreshToken(refreshToken);
        set({ token });
      },

      switchRole: (role) =>
        set((state) => {
          if (!state.availableRoles.includes(role)) return state;
          return { activeRole: role };
        }),

      initialize: async () => {
        const storedToken = await tokenStorage.getToken();
        if (!storedToken) {
          set({ initialized: true, isAuthenticated: false });
          return;
        }
        try {
          const { authService } = await import('../services/authService');
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, initialized: true });
        } catch (error) {
          captureError(error);
          await tokenStorage.clear();
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
