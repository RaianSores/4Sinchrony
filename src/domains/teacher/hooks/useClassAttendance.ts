import { useEffect, useCallback } from 'react';
import { useAttendanceStore } from '../stores/useAttendanceStore';
import type { AttendanceUpdate, AttendanceStatus } from '../../../core/types/attendance';

export function useClassAttendance(classId: string | null) {
  const {
    records, isLoading, totalCount, attendedCount, noShowCount,
    fetchAttendance, markBulkAttendance, confirmAll, updateStatus,
  } = useAttendanceStore();

  useEffect(() => {
    if (classId) {
      fetchAttendance(classId);
    }
  }, [classId, fetchAttendance]);

  const toggleStudent = useCallback(async (studentId: string) => {
    if (!classId) return;
    const record = records.find(r => r.studentId === studentId);
    if (!record) return;
    const nextStatus: AttendanceStatus = record.status === 'attended' ? 'no_show' : 'attended';
    await updateStatus(classId, studentId, nextStatus);
  }, [classId, records, updateStatus]);

  const markAllPresent = useCallback(async () => {
    if (!classId) return;
    await confirmAll(classId);
  }, [classId, confirmAll]);

  const bulkUpdate = useCallback(async (updates: AttendanceUpdate[]) => {
    if (!classId) return;
    await markBulkAttendance(classId, updates);
  }, [classId, markBulkAttendance]);

  return {
    records,
    isLoading,
    totalCount,
    attendedCount,
    noShowCount,
    pendingCount: totalCount - attendedCount - noShowCount,
    toggleStudent,
    markAllPresent,
    bulkUpdate,
    refresh: () => classId && fetchAttendance(classId),
  };
}
