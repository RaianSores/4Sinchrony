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
      // Sourced from bookings (/classes/:id/students), not the attendance table — see
      // attendanceService.getStudentsByClass for why.
      const records = await attendanceService.getStudentsByClass(classId);
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
    try {
      await attendanceService.markAttendance(classId, update);
    } catch (error: any) {
      console.log('[DEBUG markAttendance] FAILED', {
        classId,
        studentId: update.studentId,
        status: update.status,
        httpStatus: error?.response?.status,
        responseBody: error?.response?.data,
        message: error?.message,
      });
      captureError(error);
      throw error;
    }
    // Update status locally instead of trusting the attendance-table response, which can
    // omit the student entirely if their booking has no matching attendance row server-side.
    set(state => ({
      records: state.records.map(r =>
        r.studentId === update.studentId ? { ...r, status: update.status } : r
      ),
    }));
    set(state => ({
      attendedCount: state.records.filter(r => r.status === 'attended').length,
      noShowCount: state.records.filter(r => r.status === 'no_show').length,
    }));
  },

  markBulkAttendance: async (classId, updates) => {
    try {
      await attendanceService.markBulkAttendance(classId, updates);
    } catch (error) {
      captureError(error);
      throw error;
    }
    const statusByStudent = new Map(updates.map(u => [u.studentId, u.status]));
    set(state => ({
      records: state.records.map(r =>
        statusByStudent.has(r.studentId) ? { ...r, status: statusByStudent.get(r.studentId)! } : r
      ),
    }));
    set(state => ({
      attendedCount: state.records.filter(r => r.status === 'attended').length,
      noShowCount: state.records.filter(r => r.status === 'no_show').length,
    }));
  },

  confirmAll: async (classId) => {
    set({ isLoading: true });
    try {
      await attendanceService.confirmAll(classId);
    } catch (error: any) {
      console.log('[DEBUG confirmAll] FAILED', {
        classId,
        httpStatus: error?.response?.status,
        responseBody: error?.response?.data,
        message: error?.message,
      });
      captureError(error);
      set({ isLoading: false });
      throw error;
    }
    set(state => ({
      records: state.records.map(r => ({ ...r, status: 'attended' as const })),
      isLoading: false,
      attendedCount: state.records.length,
      noShowCount: 0,
    }));
  },

  updateStatus: async (classId, studentId, status) => {
    try {
      await attendanceService.updateAttendanceStatus(classId, studentId, status);
    } catch (error: any) {
      console.log('[DEBUG updateStatus] FAILED', {
        classId,
        studentId,
        status,
        httpStatus: error?.response?.status,
        responseBody: error?.response?.data,
        message: error?.message,
      });
      captureError(error);
      throw error;
    }
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
