import { useQuery } from '@tanstack/react-query';
import { classService } from '../classes/services/classService';
import { queryKeys } from '../../../core/query/keys';

export function useClasses(filters?: { date?: string; type?: string; studioId?: string }) {
  return useQuery({
    queryKey: [...queryKeys.student.classes.all, filters].filter(Boolean),
    queryFn: () => classService.getClasses(filters),
  });
}

export function useClassDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.student.classes.detail(id),
    queryFn: () => classService.getClassById(id),
    enabled: !!id,
  });
}
