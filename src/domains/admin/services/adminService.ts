const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

export interface Activity {
  id: string;
  type: 'booking' | 'subscription' | 'class' | 'payment';
  description: string;
  timestamp: string;
}

const mockDashboard: AdminDashboardData = {
  totalStudios: 3,
  totalTeachers: 12,
  totalStudents: 342,
  totalClassesThisMonth: 186,
  revenueThisMonth: 45800,
  activeSubscriptions: 215,
  occupancyRate: 74,
  recentActivities: [
    { id: 'act_1', type: 'booking', description: 'Nova reserva - Velo Power 06:30', timestamp: new Date().toISOString() },
    { id: 'act_2', type: 'subscription', description: 'Assinatura renovada - Ana Beatriz', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'act_3', type: 'class', description: 'Aula concluída - Jiu-Jitsu No-Gi', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 'act_4', type: 'payment', description: 'Pagamento recebido - R$ 189,00', timestamp: new Date(Date.now() - 10800000).toISOString() },
  ],
  monthlyRevenue: [
    { month: 'Jan', value: 32000 },
    { month: 'Fev', value: 35000 },
    { month: 'Mar', value: 38000 },
    { month: 'Abr', value: 42000 },
    { month: 'Mai', value: 45800 },
  ],
};

export const adminService = {
  async getDashboard(): Promise<AdminDashboardData> {
    await delay(600);
    return { ...mockDashboard };
  },

  async getStudents(): Promise<{ id: string; name: string; email: string; active: boolean }[]> {
    await delay(400);
    return [
      { id: 's1', name: 'Carlos Silva', email: 'carlos@email.com', active: true },
      { id: 's2', name: 'Ana Beatriz', email: 'ana@email.com', active: true },
      { id: 's3', name: 'Marcos Oliveira', email: 'marcos@email.com', active: false },
      { id: 's4', name: 'Juliana Costa', email: 'juliana@email.com', active: true },
    ];
  },

  async getTeachers(): Promise<{ id: string; name: string; email: string; specialty: string }[]> {
    await delay(400);
    return [
      { id: 't1', name: 'Ádria', email: 'adria@studio4sinchronyexperience.com', specialty: 'Velo' },
      { id: 't2', name: 'Wal', email: 'wal@studio4sinchronyexperience.com', specialty: 'Velo' },
      { id: 't3', name: 'Carlos', email: 'carlos@studio4sinchronyexperience.com', specialty: 'Jiu-Jitsu' },
    ];
  },

  async getStudios(): Promise<{ id: string; name: string; city: string; active: boolean }[]> {
    await delay(400);
    return [
      { id: 'st1', name: 'Palmas', city: 'Palmas', active: true },
      { id: 'st2', name: 'Boxe Centro', city: 'Palmas', active: true },
      { id: 'st3', name: '4Sinchrony Experience Centro', city: 'Palmas', active: true },
    ];
  },
};
