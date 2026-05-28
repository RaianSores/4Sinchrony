import { create } from 'zustand';
import { teacherMetricsService } from '../services/teacherMetricsService';
import type { TeacherMetrics } from '../services/teacherMetricsService';

interface MetricsState {
  metrics: TeacherMetrics | null;
  isLoading: boolean;
  period: 'month' | 'week';

  fetchMetrics: () => Promise<void>;
  setPeriod: (period: 'month' | 'week') => void;
}

export const useTeacherMetricsStore = create<MetricsState>((set) => ({
  metrics: null,
  isLoading: false,
  period: 'month',

  fetchMetrics: async () => {
    set({ isLoading: true });
    const metrics = await teacherMetricsService.getMetrics();
    set({ metrics, isLoading: false });
  },

  setPeriod: (period) => set({ period }),
}));
