import { api } from '../../../core/http/api';
import type { AttendanceRecord, AttendanceUpdate, AttendanceStatus } from '../../../core/types/attendance';

interface ClassStudent {
  id: string;
  name: string;
  email?: string;
  bikeNumber?: number;
  status: AttendanceStatus;
}

export const attendanceService = {
  async getAttendanceByClass(classId: string): Promise<AttendanceRecord[]> {
    const res = await api.get<{ data: AttendanceRecord[] }>(`/classes/${classId}/attendance`);
    return res.data.data ?? [];
  },

  // GET /classes/{id}/students is derived straight from bookings, so it always matches the
  // "X/Y vagas" count shown on the class card. GET /classes/{id}/attendance reads from a
  // separate attendance table that can be missing rows for real bookings (confirmed backend
  // data bug, 2026-07-02) — use this as the source of truth for "who is enrolled".
  async getStudentsByClass(classId: string): Promise<AttendanceRecord[]> {
    const res = await api.get<{ data: ClassStudent[] }>(`/classes/${classId}/students`);
    return (res.data.data ?? []).map((s) => ({
      id: s.id,
      classId,
      className: '',
      studentId: s.id,
      studentName: s.name,
      studentEmail: s.email,
      date: '',
      time: '',
      status: s.status,
      bikeNumber: s.bikeNumber,
    }));
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
