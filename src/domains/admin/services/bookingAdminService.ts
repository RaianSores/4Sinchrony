import { api } from '../../../core/http/api';
import type { AdminCheckinRecord } from './checkinAdminService';
import type { AdminClass } from './classAdminService';

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

// Achado crítico (ver docs/DEMANDA_CHECKIN_ATTENDANCE_BACKEND.md): o `status` da reserva fica
// preso em "confirmed" pra sempre — mesmo depois do professor fazer o check-in real do aluno
// (via `checkinAdminService`) e encerrar a aula — porque o backend não sincroniza o registro
// de check-in de volta pra reserva. Confirmado ao vivo em 10/07/2026 com um fluxo completo
// (reservar → check-in → iniciar aula → encerrar aula): a reserva continuou `status:"confirmed"`,
// `checkedIn:false`, mesmo com um registro de check-in real `status:"attended"` pra ela. Só
// `cancelled` é confiável no campo `status` da própria reserva (é a reserva que muda, não o
// check-in). Por isso as telas de reserva nunca devem confiar em `booking.status`/`checkedIn`
// sozinhos pra saber se o aluno compareceu — cruzam com o registro de check-in real (mesma
// fonte de verdade já usada em `AdminCheckinScreen.tsx`, Fase 6) através desta função.
export function resolveEffectiveBookingStatus(booking: AdminBooking, checkin?: AdminCheckinRecord): BookingStatus {
  if (booking.status === 'cancelled') return 'cancelled';
  if (checkin?.status === 'attended') return 'attended';
  if (checkin?.status === 'no_show') return 'no_show';
  return booking.status;
}

// `Class.status` NÃO muda sozinho quando a data/horário passa — só muda se alguém chamar o
// fluxo de sessão do professor (iniciar/encerrar). Confirmado ao vivo 20/07/2026: uma aula de
// 4 dias atrás, cuja sessão nunca foi encerrada por ninguém, continuava com `status:"scheduled"`
// — e o backend aceitou cancelar a reserva dela normalmente, com estorno de crédito. Por isso
// "a aula já acabou" não pode depender só do `status`: também comparamos `date`+`endTime`
// diretamente contra o horário atual, mesma lógica que `canCancelBooking.ts` (app do aluno) já
// usa corretamente. Sem isso, `canManageBooking`/`isOrphanedBooking` erravam silenciosamente em
// todo caso "aula já aconteceu, mas ninguém clicou pra encerrar a sessão" — que é o caso comum
// no dia a dia, não uma exceção.
function isClassOver(classInfo: AdminClass): boolean {
  if (classInfo.status === 'completed' || classInfo.status === 'cancelled') return true;
  const endMoment = new Date(`${classInfo.date}T${classInfo.endTime}:00`);
  return !isNaN(endMoment.getTime()) && endMoment.getTime() < Date.now();
}

// Caso residual: a aula já terminou mas nenhum registro de check-in existe pra essa reserva
// (mesmo bug de backend documentado acima em `resolveEffectiveBookingStatus`). Cancelar
// devolveria crédito por uma aula que já aconteceu, e "registrar falta" não faz sentido pra uma
// aula encerrada — por isso ações da UI checam esta função, não só o status. Extraído de
// `AdminBookingDetailScreen.tsx` pra ser reutilizável também na listagem (cancelar rápido
// direto na linha, item I-10 do backlog).
export function canManageBooking(booking: AdminBooking, checkin: AdminCheckinRecord | undefined, classInfo: AdminClass | undefined): boolean {
  const effectiveStatus = resolveEffectiveBookingStatus(booking, checkin);
  const classAlreadyOver = classInfo ? isClassOver(classInfo) : false;
  return effectiveStatus === 'confirmed' && !classAlreadyOver;
}

export function isOrphanedBooking(booking: AdminBooking, checkin: AdminCheckinRecord | undefined, classInfo: AdminClass | undefined): boolean {
  const effectiveStatus = resolveEffectiveBookingStatus(booking, checkin);
  const classAlreadyOver = classInfo ? isClassOver(classInfo) : false;
  return effectiveStatus === 'confirmed' && classAlreadyOver;
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
