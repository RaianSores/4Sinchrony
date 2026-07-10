import { api } from '../../../core/http/api';

export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year';

export interface ReportSummary {
  totalStudents: number;
  activeStudents: number;
  totalClasses: number;
  totalBookings: number;
  occupancyRate: number;
  checkinRate: number;
  revenue: number;
  period: string;
}

export interface OccupancyReportItem {
  date: string;
  className: string;
  totalSpots: number;
  booked: number;
  attended: number;
  occupancyPercent: number;
}

export interface FrequencyItem {
  day: string;
  count: number;
}

// Contratos confirmados ao vivo em 09/07/2026: `summary` (`GET /api/reports/summary`) retorna
// objeto direto (sem wrapper); `occupancy`/`frequency` vêm envoltos em `{data:[...]}` — igual
// ao que o `reportService.ts` do ERP já assume corretamente (são endpoints só de leitura, não
// repetem o bug de wrap/unwrap encontrado nos endpoints de escrita das fases anteriores).
// Achado importante (ver docs/DEMANDA_RELATORIOS_PERIODO_IGNORADO_BACKEND.md): os parâmetros
// `period` (summary) e `days` (occupancy) são aceitos pela API mas NÃO filtram nada — testado
// ao vivo enviando `period=month`, `period=Jul/2026` e sem parâmetro nenhum, e `days=7` vs
// `days=30`: os números voltaram idênticos em todos os casos. O seletor de período continua na
// tela (igual ao ERP, que tem o mesmo problema sem saber) — pronto pra funcionar quando o
// backend implementar o filtro de verdade.
// Achado adicional (10/07/2026, ver docs/DEMANDA_RELATORIOS_OCUPACAO_FREQUENCIA_INCORRETOS_BACKEND.md):
// `getOccupancy`/`getFrequencyByDay` voltaram dados incompletos/incorretos em teste ao vivo
// (frequência só retornava 2 dos 7 dias, ambos zerados mesmo com reserva real; ocupação
// mostrava `attended:0` pra uma aula com check-in já confirmado). `AdminReportsScreen.tsx` não
// chama mais esses dois métodos — calcula ocupação e frequência no cliente a partir de
// `classAdminService`/`bookingAdminService`/`checkinAdminService`. Os métodos continuam aqui,
// documentados e prontos pra voltar a ser usados assim que o backend corrigir.
export const reportAdminService = {
  async getSummary(period: ReportPeriod): Promise<ReportSummary> {
    const res = await api.get<ReportSummary>('/api/reports/summary', { params: { period } });
    return res.data;
  },

  async getOccupancy(days: number): Promise<OccupancyReportItem[]> {
    const res = await api.get<{ data: OccupancyReportItem[] }>('/api/reports/occupancy', { params: { days } });
    return res.data.data ?? [];
  },

  async getFrequencyByDay(): Promise<FrequencyItem[]> {
    const res = await api.get<{ data: FrequencyItem[] }>('/api/reports/frequency');
    return res.data.data ?? [];
  },
};
