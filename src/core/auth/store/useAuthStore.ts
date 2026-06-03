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
  activeRole: Role;
  availableRoles: Role[];

  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  switchRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      activeRole: 'student',
      availableRoles: ['student'],

      login: (user, token) => {
        tokenStorage.setToken(token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          activeRole: user.role,
          availableRoles: [user.role],
        });
      },

      logout: () => {
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

      switchRole: (role) =>
        set((state) => {
          if (!state.availableRoles.includes(role)) return state;
          return { activeRole: role };
        }),
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
