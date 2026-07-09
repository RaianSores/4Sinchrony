import { api } from '../../../core/http/api';

export type ClassStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface AdminClass {
  id: string;
  name: string;
  type: string;
  classTypeId: string;
  instructor: string;
  teacherId: string;
  studioId: string;
  studioName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalSpots: number;
  availableSpots: number;
  status: ClassStatus;
  enrolledCount: number;
}

export interface ClassCreateData {
  name: string;
  classTypeId: string;
  teacherId: string;
  studioId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalSpots: number;
}

export type ClassUpdateData = ClassCreateData & { status: ClassStatus };

// Contratos confirmados ao vivo em 09/07/2026: list (`GET /api/classes`) vem envolto em
// `{data:[...]}`; getById/create/update retornam o objeto direto (sem wrapper) — mesmo padrão
// de Tipos de Aula, e diferente do que o `classService.ts` do ERP assume pra create/update.
// Achados importantes, todos confirmados com requisições reais contra a API de produção:
// - `endTime` é obrigatório no payload (400 sem ele) — o backend NÃO calcula a partir de
//   startTime+duration, então quem chama precisa somar isso antes de enviar (mesma lógica que
//   o ERP já faz no formulário).
// - `PUT` exige `status` no corpo (400 "The status field is required" sem isso); `POST` não
//   aceita/usa esse campo e sempre cria como 'scheduled'. Não existe endpoint de exclusão nem
//   de cancelamento dedicado (DELETE responde 405) — cancelar uma aula é só um `update` normal
//   com `status:'cancelled'`.
// - Campos computados pelo servidor (`type`, `instructor`, `studioName`, `availableSpots`,
//   `enrolledCount`) não devem ser enviados no payload — a API os recalcula de qualquer forma
//   a partir de `classTypeId`/`teacherId`/`studioId` (diferente do ERP, que envia mesmo assim).
// - A resposta de create/update traz um objeto `studio` aninhado (`{id,name,address,...}`) em
//   vez dos campos `studioId`/`studioName` planos que list/getById retornam — por isso as
//   telas não devem confiar na resposta do create/update pra atualizar estado local; sempre
//   recarregar via `list()` (ex: no `focus` da tela de listagem) depois de salvar.
export const classAdminService = {
  async list(): Promise<AdminClass[]> {
    const res = await api.get<{ data: AdminClass[] }>('/api/classes');
    return res.data.data ?? [];
  },

  async getById(id: string): Promise<AdminClass | undefined> {
    try {
      const res = await api.get<AdminClass>(`/api/classes/${id}`);
      return res.data;
    } catch {
      return undefined;
    }
  },

  async create(data: ClassCreateData): Promise<AdminClass> {
    const res = await api.post<AdminClass>('/api/classes', data);
    return res.data;
  },

  async update(id: string, data: ClassUpdateData): Promise<AdminClass> {
    const res = await api.put<AdminClass>(`/api/classes/${id}`, data);
    return res.data;
  },
};
