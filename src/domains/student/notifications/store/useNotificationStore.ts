import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationPreference } from '../../../../shared/types';
import { notificationService } from '../services/notificationService';
import { captureError } from '../../../../lib/sentry';

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  { id: 'booking_reminder',      title: 'Lembrete de aula',      description: 'Aviso 1h antes do início da aula',           icon: 'alarm-outline',            enabled: true  },
  { id: 'booking_confirmation',  title: 'Confirmação de reserva', description: 'Ao confirmar uma nova reserva',              icon: 'checkmark-circle-outline', enabled: true  },
  { id: 'booking_cancellation',  title: 'Cancelamento de aula',   description: 'Quando uma aula for cancelada pelo studio',  icon: 'close-circle-outline',     enabled: true  },
  { id: 'credits_low',           title: 'Créditos baixos',        description: 'Quando seus créditos estiverem acabando',    icon: 'wallet-outline',           enabled: true  },
  { id: 'promotions',            title: 'Promoções',              description: 'Novidades e ofertas especiais',              icon: 'pricetag-outline',         enabled: false },
];

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
        try {
          const preferences = await notificationService.getPreferences();
          // Use API preferences if populated; fall back to defaults with enabled state merged
          if (preferences.length > 0) {
            set({ preferences, isLoading: false });
          } else {
            const existing = get().preferences;
            const merged = DEFAULT_PREFERENCES.map(def => {
              const saved = existing.find(p => p.id === def.id);
              return saved ? { ...def, enabled: saved.enabled } : def;
            });
            set({ preferences: merged, isLoading: false });
          }
        } catch (error) {
          captureError(error);
          if (get().preferences.length === 0) {
            set({ preferences: DEFAULT_PREFERENCES, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        }
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
