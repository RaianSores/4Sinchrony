import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationPreference } from '../../../../shared/types';
import { notificationService } from '../services/notificationService';

interface NotificationState {
  pushEnabled: boolean;
  emailEnabled: boolean;
  preferences: NotificationPreference[];
  isLoading: boolean;

  fetchPreferences: () => Promise<void>;
  togglePreference: (id: string) => Promise<void>;
  togglePush: () => Promise<void>;
  toggleEmail: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      pushEnabled: true,
      emailEnabled: true,
      preferences: [],
      isLoading: false,

      fetchPreferences: async () => {
        set({ isLoading: true });
        const preferences = await notificationService.getPreferences();
        set({ preferences, isLoading: false });
      },

      togglePreference: async (id) => {
        const { preferences } = get();
        const pref = preferences.find(p => p.id === id);
        if (!pref) return;

        const updated = !pref.enabled;
        await notificationService.togglePreference(id, updated);

        set({
          preferences: preferences.map(p =>
            p.id === id ? { ...p, enabled: updated } : p
          ),
        });
      },

      togglePush: async () => {
        const next = !get().pushEnabled;
        await notificationService.togglePush(next);
        set({ pushEnabled: next });
      },

      toggleEmail: async () => {
        const next = !get().emailEnabled;
        await notificationService.toggleEmail(next);
        set({ emailEnabled: next });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pushEnabled: state.pushEnabled,
        emailEnabled: state.emailEnabled,
        preferences: state.preferences,
      }),
    }
  )
);
