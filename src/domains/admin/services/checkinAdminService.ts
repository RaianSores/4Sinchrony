import { api } from '../../../core/http/api';

export type CheckinStatus = 'confirmed' | 'attended' | 'no_show';

export interface AdminCheckinRecord {
  id: string;
  bookingId: string;
  classId: string;
  studentId: string;
  studentName: string;
  className: string | null;
  date: string;
  time: string;
  status: CheckinStatus;
  confirmedBy: string | null;
  confirmedAt: string | null;
}

// Contratos confirmados ao vivo em 09/07/2026: `GET /api/checkin` vem envolto em
// `{data:[...]}`; `confirm` retorna o objeto direto (sem wrapper, sem exigir body — testado
// enviando `{}`) — mesmo padrão de todas as fases anteriores, diferente do que o
// `checkinService.ts` do ERP assume (ele trata `confirm` como envolto em `{data}` e ainda
// manda um campo `confirmedBy` fixo `'Admin'` no corpo, que a API real ignora — o campo vem
// do JWT no servidor, ficou `null` mesmo confirmando como admin no teste ao vivo).
// Achado: `date`/`time` do registro de check-in NÃO são o horário da aula — são timestamps de
// quando o check-in foi confirmado (testado ao vivo: o `time` mudou pra hora atual depois de
// chamar `confirm`). Por isso as telas usam a data/hora da própria `Class`
// (`classAdminService`) pra exibir o horário real da aula, não os campos `date`/`time` daqui.
// `no-show` NÃO está documentado em API_REFERENCE.md e não foi testado ao vivo (não havia
// registro em estado seguro pra testar sem mexer em reserva real de aluno) — implementado
// seguindo o mesmo padrão raw dos demais endpoints de escrita deste recurso, mas trate como
// não 100% confirmado até o primeiro uso real.
// Achado crítico (ver docs/DEMANDA_CHECKIN_ATTENDANCE_BACKEND.md): reservas confirmadas podem
// não ter um registro de check-in correspondente ainda (bug de backend já documentado) — por
// isso a tela de check-in do admin cruza esta lista com `bookingAdminService.list()` e mostra
// reservas confirmadas sem check-in como "Sem registro" (sem ação disponível) em vez de
// simplesmente escondê-las ou quebrar tentando confirmar um id que não existe.
export const checkinAdminService = {
  async listAll(): Promise<AdminCheckinRecord[]> {
    const res = await api.get<{ data: AdminCheckinRecord[] }>('/api/checkin');
    return res.data.data ?? [];
  },

  async confirm(id: string): Promise<AdminCheckinRecord> {
    const res = await api.post<AdminCheckinRecord>(`/api/checkin/${id}/confirm`, {});
    return res.data;
  },

  async markNoShow(id: string): Promise<AdminCheckinRecord> {
    const res = await api.post<AdminCheckinRecord>(`/api/checkin/${id}/no-show`, {});
    return res.data;
  },
};
