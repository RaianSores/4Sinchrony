const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface TeacherMetrics {
  totalClassesThisMonth: number;
  totalStudentsAttended: number;
  uniqueStudents: number;
  averageOccupancyRate: number;
  averageCheckinRate: number;
  classesByWeek: { week: string; count: number }[];
  occupancyTrend: { date: string; rate: number }[];
}

const mockMetrics: TeacherMetrics = {
  totalClassesThisMonth: 42,
  totalStudentsAttended: 318,
  uniqueStudents: 89,
  averageOccupancyRate: 78.5,
  averageCheckinRate: 92.3,
  classesByWeek: [
    { week: 'Semana 1', count: 10 },
    { week: 'Semana 2', count: 12 },
    { week: 'Semana 3', count: 9 },
    { week: 'Semana 4', count: 11 },
  ],
  occupancyTrend: [
    { date: 'Seg', rate: 75 },
    { date: 'Ter', rate: 82 },
    { date: 'Qua', rate: 79 },
    { date: 'Qui', rate: 85 },
    { date: 'Sex', rate: 72 },
    { date: 'Sáb', rate: 68 },
    { date: 'Dom', rate: 45 },
  ],
};

export const teacherMetricsService = {
  async getMetrics(): Promise<TeacherMetrics> {
    await delay(500);
    return { ...mockMetrics };
  },

  async getMonthlyMetrics(_month: number, _year: number): Promise<TeacherMetrics> {
    await delay(500);
    return {
      ...mockMetrics,
      totalClassesThisMonth: Math.floor(Math.random() * 30) + 20,
    };
  },
};
