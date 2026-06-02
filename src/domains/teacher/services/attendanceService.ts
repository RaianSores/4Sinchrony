import { api } from '../../../core/http/api';
import type { AttendanceRecord, AttendanceUpdate, AttendanceStatus } from '../../../core/types/attendance';

export const attendanceService = {
  async getAttendanceByClass(classId: string): Promise<AttendanceRecord[]> {
    const res = await api.get<{ data: AttendanceRecord[] }>(`/classes/${classId}/attendance`);
    return res.data.data ?? [];
  },

  async markAttendance(classId: string, update: AttendanceUpdate): Promise<AttendanceRecord> {
    const res = await api.put<{ data: AttendanceRecord }>(`/classes/${classId}/attendance`, {
      studentId: update.studentId,
      status: update.status,
    });
    return res.data.data;
  },

  async markBulkAttendance(classId: string, updates: AttendanceUpdate[]): Promise<AttendanceRecord[]> {
    const res = await api.post<{ data: AttendanceRecord[] }>(`/classes/${classId}/attendance/bulk`, { updates });
    return res.data.data ?? [];
  },

  async confirmAll(classId: string): Promise<AttendanceRecord[]> {
    const res = await api.post<{ data: AttendanceRecord[] }>(`/classes/${classId}/attendance/confirm-all`);
    return res.data.data ?? [];
  },

  async getAttendanceCount(classId: string): Promise<{ total: number; attended: number; noShow: number }> {
    const res = await api.get<{ total: number; attended: number; noShow: number; pending: number }>(
      `/classes/${classId}/attendance/summary`,
    );
    return { total: res.data.total, attended: res.data.attended, noShow: res.data.noShow };
  },

  async updateAttendanceStatus(classId: string, studentId: string, status: AttendanceStatus): Promise<void> {
    await api.put(`/classes/${classId}/attendance`, { studentId, status });
  },
};
