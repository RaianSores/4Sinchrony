import { create } from 'zustand';
import { teacherMetricsService } from '../services/teacherMetricsService';
import { captureError } from '../../../lib/sentry';
import type { TeacherMetrics } from '../services/teacherMetricsService';

interface MetricsState {
  metrics: TeacherMetrics | null;
  isLoading: boolean;
  hasError: boolean;
  period: 'month' | 'week';

  fetchMetrics: () => Promise<void>;
  setPeriod: (period: 'month' | 'week') => void;
}

export const useTeacherMetricsStore = create<MetricsState>((set) => ({
  metrics: null,
  isLoading: false,
  hasError: false,
  period: 'month',

  fetchMetrics: async () => {
    set({ isLoading: true, hasError: false });
    try {
      const metrics = await teacherMetricsService.getMetrics();
      set({ metrics, isLoading: false });
    } catch (error) {
      captureError(error);
      set({ isLoading: false, hasError: true });
    }
  },

  setPeriod: (period) => set({ period }),
}));
