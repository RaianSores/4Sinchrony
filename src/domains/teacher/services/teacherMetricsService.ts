import { api } from '../../../core/http/api';

export interface TeacherMetrics {
  totalClassesThisMonth: number;
  totalStudentsAttended: number;
  uniqueStudents: number;
  averageOccupancyRate: number;
  averageCheckinRate: number;
  classesByWeek: { week: string; count: number }[];
  occupancyTrend: { date: string; rate: number }[];
}

export const teacherMetricsService = {
  async getMetrics(): Promise<TeacherMetrics> {
    const res = await api.get<{ data: TeacherMetrics }>('/teachers/me/metrics');
    return res.data.data;
  },

  async getMonthlyMetrics(_month: number, _year: number): Promise<TeacherMetrics> {
    return teacherMetricsService.getMetrics();
  },
};
