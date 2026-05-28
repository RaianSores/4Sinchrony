import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendanceService';
import type { AttendanceUpdate, AttendanceStatus } from '../../../core/types/attendance';
import { queryKeys } from '../../../core/query/keys';

export function useAttendanceQuery(classId: string) {
  return useQuery({
    queryKey: queryKeys.teacher.attendance.list(classId),
    queryFn: () => attendanceService.getAttendanceByClass(classId),
    enabled: !!classId,
  });
}

export function useMarkAttendance(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update: AttendanceUpdate) =>
      attendanceService.updateAttendanceStatus(classId, update.studentId, update.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.attendance.list(classId) });
    },
  });
}

export function useConfirmAll(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => attendanceService.confirmAll(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.attendance.list(classId) });
    },
  });
}

export function useUpdateAttendanceStatus(classId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { studentId: string; status: AttendanceStatus }) =>
      attendanceService.updateAttendanceStatus(classId, params.studentId, params.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.attendance.list(classId) });
    },
  });
}

export function useAttendanceCount(classId: string) {
  return useQuery({
    queryKey: [...queryKeys.teacher.attendance.list(classId), 'count'],
    queryFn: () => attendanceService.getAttendanceCount(classId),
    enabled: !!classId,
  });
}
