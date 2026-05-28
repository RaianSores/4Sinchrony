import { useQuery } from '@tanstack/react-query';
import { teacherClassService } from '../services/teacherClassService';
import { queryKeys } from '../../../core/query/keys';

export function useTeacherClasses(date?: string) {
  return useQuery({
    queryKey: date ? queryKeys.teacher.classes.byDate(date) : queryKeys.teacher.classes.all,
    queryFn: () => date
      ? teacherClassService.getMyClasses(date)
      : teacherClassService.getMyClasses(),
  });
}

export function useTodayClasses() {
  return useQuery({
    queryKey: queryKeys.teacher.classes.today,
    queryFn: () => teacherClassService.getTodayClasses(),
  });
}

export function useTeacherClassDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.teacher.classes.detail(id),
    queryFn: () => teacherClassService.getClassById(id),
    enabled: !!id,
  });
}
