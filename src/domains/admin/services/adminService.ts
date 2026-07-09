import { api } from '../../../core/http/api';

export interface Activity {
  id: string;
  type: 'booking' | 'subscription' | 'class' | 'payment';
  description: string;
  timestamp: string;
}

export interface AdminDashboardData {
  totalStudios: number;
  totalTeachers: number;
  totalStudents: number;
  totalClassesThisMonth: number;
  revenueThisMonth: number;
  activeSubscriptions: number;
  occupancyRate: number;
  recentActivities: Activity[];
  monthlyRevenue: { month: string; value: number }[];
}

export const adminService = {
  async getDashboard(): Promise<AdminDashboardData> {
    const res = await api.get<AdminDashboardData>('/admin/dashboard');
    // `occupancyRate` de /admin/dashboard vem fixo/incorreto do backend (confirmado
    // 09/07/2026: mostrava 74% tanto com 0 aulas cadastradas quanto com dados reais
    // diferentes depois — nunca muda, não reflete dado nenhum). /api/reports/summary
    // calcula esse mesmo número corretamente a partir dos dados reais, então usamos
    // ele aqui em vez do valor quebrado. Ver DEMANDA_TEACHER_ME_CLASSES_INSTRUCTOR_BACKEND.md.
    const occupancyRate = await api
      .get<{ occupancyRate: number }>('/api/reports/summary')
      .then(r => r.data.occupancyRate)
      .catch(() => res.data.occupancyRate);
    return { ...res.data, occupancyRate };
  },
};
