import { api } from '../../../core/http/api';

export type BookingStatus = 'confirmed' | 'cancelled' | 'attended' | 'no_show';

export interface AdminBooking {
  id: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: BookingStatus;
  bikeNumber: number | null;
  bookedAt: string;
  checkedIn: boolean;
}

// Contratos confirmados ao vivo em 09/07/2026: list (`GET /api/bookings`) vem envolto em
// `{data:[...], pagination}`; `cancel`/`no-show` retornam o objeto direto (sem wrapper) —
// mesmo padrão de todas as fases anteriores, e diferente do que o `bookingService.ts` do ERP
// assume (ele trata cancel/no-show como envoltos em `{data}`, mas a API real não envolve — o
// ERP só não quebra porque descarta o retorno e recarrega a lista inteira depois).
// Achado importante: `GET /api/bookings/:id` devolve um objeto MENOR que o item da listagem —
// só tem `classId`/`studentId` (ids), sem `studentName`/`studentEmail`/`className`
// denormalizados. Por isso as telas não usam `getById` pra abrir o detalhe: navegam com o
// objeto completo já carregado na listagem via params de rota. `getById` continua aqui só por
// completude/consistência com os outros serviços admin.
export const bookingAdminService = {
  async list(): Promise<AdminBooking[]> {
    const res = await api.get<{ data: AdminBooking[] }>('/api/bookings');
    return res.data.data ?? [];
  },

  async getById(id: string): Promise<AdminBooking | undefined> {
    try {
      const res = await api.get<AdminBooking>(`/api/bookings/${id}`);
      return res.data;
    } catch {
      return undefined;
    }
  },

  async cancel(id: string): Promise<AdminBooking> {
    const res = await api.patch<AdminBooking>(`/api/bookings/${id}/cancel`);
    return res.data;
  },

  async markNoShow(id: string): Promise<AdminBooking> {
    const res = await api.patch<AdminBooking>(`/api/bookings/${id}/no-show`);
    return res.data;
  },
};
