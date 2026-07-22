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
    // O backend passou a retornar `monthlyRevenue` com o campo `revenue` (não `value`) —
    // confirmado ao vivo 22/07/2026: `[{"month":"Apr/2026","revenue":0}]`. Sem normalizar,
    // `item.value` fica `undefined` e o gráfico de barras calcula `height: NaN`. Lê os dois
    // nomes defensivamente. (Idêntico ao fix do ERP em dashboardService.ts.)
    const monthlyRevenue = (res.data.monthlyRevenue ?? []).map((m) => {
      const raw = m as { month: string; value?: number; revenue?: number };
      return { month: raw.month, value: raw.value ?? raw.revenue ?? 0 };
    });
    return { ...res.data, occupancyRate, monthlyRevenue };
  },
};
