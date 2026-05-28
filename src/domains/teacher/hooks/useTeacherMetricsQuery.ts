import { useQuery } from '@tanstack/react-query';
import { teacherMetricsService } from '../services/teacherMetricsService';
import { queryKeys } from '../../../core/query/keys';

export function useTeacherMetrics() {
  return useQuery({
    queryKey: queryKeys.teacher.metrics.all,
    queryFn: () => teacherMetricsService.getMetrics(),
  });
}

export function useMonthlyMetrics(month: number, year: number) {
  return useQuery({
    queryKey: queryKeys.teacher.metrics.monthly(month, year),
    queryFn: () => teacherMetricsService.getMonthlyMetrics(month, year),
  });
}
