import { create } from 'zustand';
import type { ClassSession } from '../../../core/types/class';
import { teacherClassService } from '../services/teacherClassService';

interface SessionState {
  currentSession: ClassSession | null;
  isLoading: boolean;
  isActive: boolean;

  startSession: (classId: string) => Promise<void>;
  endSession: (classId: string) => Promise<void>;
  getSession: (classId: string) => Promise<void>;
  clearSession: () => void;
}

export const useTeacherSessionStore = create<SessionState>((set) => ({
  currentSession: null,
  isLoading: false,
  isActive: false,

  startSession: async (classId) => {
    set({ isLoading: true });
    const session = await teacherClassService.startClass(classId);
    set({ currentSession: session, isLoading: false, isActive: true });
  },

  endSession: async (classId) => {
    set({ isLoading: true });
    const session = await teacherClassService.endClass(classId);
    set({ currentSession: session, isLoading: false, isActive: false });
  },

  getSession: async (classId) => {
    set({ isLoading: true });
    const session = await teacherClassService.getCurrentSession(classId);
    set({ currentSession: session, isLoading: false, isActive: session?.status === 'in_progress' });
  },

  clearSession: () => set({ currentSession: null, isActive: false }),
}));
