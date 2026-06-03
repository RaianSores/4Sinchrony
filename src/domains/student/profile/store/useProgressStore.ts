import { create } from 'zustand';
import { StudentProgress } from '../../../../shared/types';
import { progressService } from '../services/progressService';

interface ProgressState {
  progress: StudentProgress | null;
  isLoading: boolean;
  fetchProgress: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set) => ({
  progress: null,
  isLoading: false,

  fetchProgress: async () => {
    set({ isLoading: true });
    try {
      const progress = await progressService.getProgress();
      set({ progress, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
