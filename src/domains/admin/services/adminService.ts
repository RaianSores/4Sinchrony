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
    return res.data;
  },

  async getStudents(): Promise<{ id: string; name: string; email: string; active: boolean }[]> {
    const res = await api.get<{ data: any[] }>('/api/students');
    return (res.data.data ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      active: s.status === 'active',
    }));
  },

  async getTeachers(): Promise<{ id: string; name: string; email: string; specialty: string }[]> {
    const res = await api.get<{ data: any[] }>('/api/teachers');
    return (res.data.data ?? []).map((t: any) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      specialty: (t.specialties || []).join(', '),
    }));
  },

  async getStudios(): Promise<{ id: string; name: string; city: string; active: boolean }[]> {
    const res = await api.get<{ data: any[] }>('/api/studios');
    return (res.data.data ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      city: s.address || '',
      active: s.active,
    }));
  },
};
