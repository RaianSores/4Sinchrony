import { api } from '../../../../core/http/api';
import { ReferralInfo, Achievement } from '../../../../shared/types';

export const referralService = {
  async getReferral(): Promise<ReferralInfo> {
    const res = await api.get<ReferralInfo>('/referral');
    return res.data;
  },

  async getAchievements(): Promise<Achievement[]> {
    const res = await api.get<{ data: Achievement[] }>('/referral/achievements');
    return res.data.data ?? [];
  },
};
