import { api } from '../../../../core/http/api';
import { StudentProgress } from '../../../../shared/types';

export const progressService = {
  async getProgress(): Promise<StudentProgress> {
    const res = await api.get<StudentProgress>('/profile/progress');
    return res.data;
  },
};
