import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherClassService } from '../services/teacherClassService';
import { queryKeys } from '../../../core/query/keys';

export function useStartClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: string) => teacherClassService.startClass(classId),
    onSuccess: (_, classId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.sessions.current(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.classes.detail(classId) });
    },
  });
}

export function useEndClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: string) => teacherClassService.endClass(classId),
    onSuccess: (_, classId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.sessions.current(classId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.classes.detail(classId) });
    },
  });
}
