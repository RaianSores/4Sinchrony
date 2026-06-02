import { api } from '../../../../core/http/api';
import { NotificationPreference } from '../../../../shared/types';

export const notificationService = {
  async getPreferences(): Promise<NotificationPreference[]> {
    const res = await api.get<{ pushEnabled: boolean; emailEnabled: boolean; preferences: NotificationPreference[] }>(
      '/notifications/preferences',
    );
    return res.data.preferences ?? [];
  },

  async togglePreference(id: string, enabled: boolean): Promise<void> {
    await api.put(`/notifications/preferences/${id}`, { enabled });
  },

  async togglePush(enabled: boolean): Promise<void> {
    await api.put('/notifications/push', { enabled });
  },

  async toggleEmail(enabled: boolean): Promise<void> {
    await api.put('/notifications/email', { enabled });
  },
};
