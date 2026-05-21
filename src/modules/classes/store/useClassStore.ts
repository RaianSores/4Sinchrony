import { create } from 'zustand';
import { Class } from '../../../shared/types';
import { classService } from '../services/classService';

interface ClassFilters {
  date: string;
  type: string;
  studioId?: string;
}

interface ClassState {
  classes: Class[];
  selectedClass: Class | null;
  filters: ClassFilters;
  isLoading: boolean;
  fetchClasses: () => Promise<void>;
  setFilters: (filters: Partial<ClassFilters>) => void;
  selectClass: (classItem: Class | null) => void;
}

export const useClassStore = create<ClassState>((set, get) => ({
  classes: [],
  selectedClass: null,
  filters: { date: '', type: '' },
  isLoading: false,

  fetchClasses: async () => {
    set({ isLoading: true });
    const { filters } = get();
    const classes = await classService.getClasses({
      date: filters.date,
      type: filters.type || undefined,
      studioId: filters.studioId,
    });
    set({ classes, isLoading: false });
  },

  setFilters: (newFilters) =>
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    })),

  selectClass: (classItem) => set({ selectedClass: classItem }),
}));
