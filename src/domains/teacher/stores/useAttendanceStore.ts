import { create } from 'zustand';
import type { AttendanceRecord, AttendanceUpdate, AttendanceStatus } from '../../../core/types/attendance';
import { attendanceService } from '../services/attendanceService';
import { captureError } from '../../../lib/sentry';

interface AttendanceState {
  records: AttendanceRecord[];
  isLoading: boolean;
  totalCount: number;
  attendedCount: number;
  noShowCount: number;

  fetchAttendance: (classId: string) => Promise<void>;
  markAttendance: (classId: string, update: AttendanceUpdate) => Promise<void>;
  markBulkAttendance: (classId: string, updates: AttendanceUpdate[]) => Promise<void>;
  confirmAll: (classId: string) => Promise<void>;
  updateStatus: (classId: string, studentId: string, status: AttendanceStatus) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  records: [],
  isLoading: false,
  totalCount: 0,
  attendedCount: 0,
  noShowCount: 0,

  fetchAttendance: async (classId) => {
    set({ isLoading: true });
    try {
      const records = await attendanceService.getAttendanceByClass(classId);
      const totalCount = records.length;
      const attendedCount = records.filter(r => r.status === 'attended').length;
      const noShowCount = records.filter(r => r.status === 'no_show').length;
      set({ records, isLoading: false, totalCount, attendedCount, noShowCount });
    } catch (error) {
      captureError(error);
      set({ isLoading: false });
    }
  },

  markAttendance: async (classId, update) => {
    const record = await attendanceService.markAttendance(classId, update);
    set(state => ({
      records: state.records.map(r =>
        r.studentId === record.studentId ? record : r
      ),
    }));
    set(state => ({
      attendedCount: state.records.filter(r => r.status === 'attended').length,
      noShowCount: state.records.filter(r => r.status === 'no_show').length,
    }));
  },

  markBulkAttendance: async (classId, updates) => {
    const records = await attendanceService.markBulkAttendance(classId, updates);
    set({
      records,
      attendedCount: records.filter(r => r.status === 'attended').length,
      noShowCount: records.filter(r => r.status === 'no_show').length,
    });
  },

  confirmAll: async (classId) => {
    set({ isLoading: true });
    try {
      const records = await attendanceService.confirmAll(classId);
      set({
        records,
        isLoading: false,
        attendedCount: records.length,
        noShowCount: 0,
      });
    } catch (error) {
      captureError(error);
      set({ isLoading: false });
    }
  },

  updateStatus: async (classId, studentId, status) => {
    await attendanceService.updateAttendanceStatus(classId, studentId, status);
    set(state => ({
      records: state.records.map(r =>
        r.studentId === studentId ? { ...r, status } : r
      ),
    }));
    set(state => ({
      attendedCount: state.records.filter(r => r.status === 'attended').length,
      noShowCount: state.records.filter(r => r.status === 'no_show').length,
    }));
  },
}));
