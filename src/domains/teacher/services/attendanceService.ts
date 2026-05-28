import type { AttendanceRecord, AttendanceUpdate, AttendanceStatus } from '../../../core/types/attendance';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockAttendance: Record<string, AttendanceRecord[]> = {};

function getOrCreateAttendance(classId: string): AttendanceRecord[] {
  if (!mockAttendance[classId]) {
    mockAttendance[classId] = [
      {
        id: 'att_1',
        classId,
        className: 'Velo Power',
        studentId: 'student_1',
        studentName: 'Carlos Silva',
        studentEmail: 'carlos@email.com',
        date: new Date().toISOString().split('T')[0],
        time: '06:30',
        status: 'confirmed',
      },
      {
        id: 'att_2',
        classId,
        className: 'Velo Power',
        studentId: 'student_2',
        studentName: 'Ana Beatriz',
        studentEmail: 'ana@email.com',
        date: new Date().toISOString().split('T')[0],
        time: '06:30',
        status: 'confirmed',
      },
      {
        id: 'att_3',
        classId,
        className: 'Velo Power',
        studentId: 'student_3',
        studentName: 'Marcos Oliveira',
        studentEmail: 'marcos@email.com',
        date: new Date().toISOString().split('T')[0],
        time: '06:30',
        status: 'confirmed',
      },
      {
        id: 'att_4',
        classId,
        className: 'Velo Power',
        studentId: 'student_4',
        studentName: 'Juliana Costa',
        studentEmail: 'juliana@email.com',
        date: new Date().toISOString().split('T')[0],
        time: '06:30',
        status: 'confirmed',
      },
      {
        id: 'att_5',
        classId,
        className: 'Velo Power',
        studentId: 'student_5',
        studentName: 'Roberto Lima',
        studentEmail: 'roberto@email.com',
        date: new Date().toISOString().split('T')[0],
        time: '06:30',
        status: 'confirmed',
      },
    ];
  }
  return mockAttendance[classId];
}

export const attendanceService = {
  async getAttendanceByClass(classId: string): Promise<AttendanceRecord[]> {
    await delay(400);
    return getOrCreateAttendance(classId);
  },

  async markAttendance(classId: string, update: AttendanceUpdate): Promise<AttendanceRecord> {
    await delay(300);
    const records = getOrCreateAttendance(classId);
    const index = records.findIndex(r => r.studentId === update.studentId);
    if (index >= 0) {
      records[index] = {
        ...records[index],
        status: update.status,
        confirmedAt: new Date().toISOString(),
      };
    }
    return records[index];
  },

  async markBulkAttendance(classId: string, updates: AttendanceUpdate[]): Promise<AttendanceRecord[]> {
    await delay(500);
    const results: AttendanceRecord[] = [];
    for (const update of updates) {
      const record = await attendanceService.markAttendance(classId, update);
      results.push(record);
    }
    return results;
  },

  async confirmAll(classId: string): Promise<AttendanceRecord[]> {
    await delay(400);
    const records = getOrCreateAttendance(classId);
    const now = new Date().toISOString();
    for (const record of records) {
      record.status = 'attended';
      record.confirmedAt = now;
    }
    return records;
  },

  async getAttendanceCount(classId: string): Promise<{ total: number; attended: number; noShow: number }> {
    await delay(200);
    const records = getOrCreateAttendance(classId);
    return {
      total: records.length,
      attended: records.filter(r => r.status === 'attended').length,
      noShow: records.filter(r => r.status === 'no_show').length,
    };
  },

  async updateAttendanceStatus(classId: string, studentId: string, status: AttendanceStatus): Promise<void> {
    await delay(200);
    const records = getOrCreateAttendance(classId);
    const record = records.find(r => r.studentId === studentId);
    if (record) {
      record.status = status;
      record.confirmedAt = new Date().toISOString();
    }
  },
};
