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
    // GET /teachers/me/metrics returns the metrics object at the top level (no `data` wrapper),
    // unlike most other endpoints in this API — confirmed against the real API 2026-07-02.
    const res = await api.get<TeacherMetrics>('/teachers/me/metrics');
    // `classesByWeek`/`occupancyTrend` são renderizados com `.map`/`.length` direto na
    // MetricsScreen (que só protege contra `metrics` nulo, não contra os arrays internos).
    // Garantir array aqui evita crash se o backend mudar o shape ou omitir esses campos —
    // mesma classe de bug que derrubou dashboard/relatórios em 22/07 quando a API passou a
    // devolver dado real com formato diferente.
    return {
      ...res.data,
      classesByWeek: res.data.classesByWeek ?? [],
      occupancyTrend: res.data.occupancyTrend ?? [],
    };
  },

  async getMonthlyMetrics(_month: number, _year: number): Promise<TeacherMetrics> {
    return teacherMetricsService.getMetrics();
  },
};
