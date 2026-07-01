import { create } from 'zustand';
import type { Class, ClassSession } from '../../../core/types/class';
import { teacherClassService } from '../services/teacherClassService';
import { captureError } from '../../../lib/sentry';

interface TeacherClassState {
  classes: Class[];
  selectedClass: Class | null;
  currentSession: ClassSession | null;
  isLoading: boolean;
  sessionLoading: boolean;

  fetchMyClasses: (date?: string) => Promise<void>;
  fetchClassById: (id: string) => Promise<void>;
  startClass: (classId: string) => Promise<void>;
  endClass: (classId: string) => Promise<void>;
  getCurrentSession: (classId: string) => Promise<void>;
  selectClass: (cls: Class | null) => void;
}

export const useTeacherClassStore = create<TeacherClassState>((set) => ({
  classes: [],
  selectedClass: null,
  currentSession: null,
  isLoading: false,
  sessionLoading: false,

  fetchMyClasses: async (date) => {
    set({ isLoading: true });
    try {
      const classes = await teacherClassService.getMyClasses(date);
      set({ classes, isLoading: false });
    } catch (error) {
      captureError(error);
      set({ isLoading: false });
    }
  },

  fetchClassById: async (id) => {
    set({ isLoading: true });
    try {
      const cls = await teacherClassService.getClassById(id);
      set({ selectedClass: cls ?? null, isLoading: false });
    } catch (error) {
      captureError(error);
      set({ isLoading: false });
    }
  },

  startClass: async (classId) => {
    set({ sessionLoading: true });
    try {
      const session = await teacherClassService.startClass(classId);
      set({ currentSession: session, sessionLoading: false });
    } catch (error) {
      captureError(error);
      set({ sessionLoading: false });
    }
  },

  endClass: async (classId) => {
    set({ sessionLoading: true });
    try {
      const session = await teacherClassService.endClass(classId);
      set({ currentSession: session, sessionLoading: false });
    } catch (error) {
      captureError(error);
      set({ sessionLoading: false });
    }
  },

  getCurrentSession: async (classId) => {
    set({ sessionLoading: true });
    try {
      const session = await teacherClassService.getCurrentSession(classId);
      set({ currentSession: session, sessionLoading: false });
    } catch (error) {
      captureError(error);
      set({ sessionLoading: false });
    }
  },

  selectClass: (cls) => set({ selectedClass: cls }),
}));
