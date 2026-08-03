import { api } from '../../../core/http/api';

export type StudentStatus = 'active' | 'inactive' | 'blocked';

// Campos de endereço (opcionais) — necessários pro pagamento por cartão (Asaas exige CEP+
// número do portador). Ver docs/DEMANDA_CADASTRO_ENDERECO_CLIENTE_BACKEND.md.
export interface AddressFields {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface AdminStudent extends AddressFields {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  phone: string;
  status: StudentStatus;
  plan: string | null;
  unitId?: string | null;
  unitName?: string | null;
  credits: number;
  avatar: string | null;
  registeredAt: string;
  lastVisit: string | null;
  totalClasses: number;
  // Pacote família: dependente é um Student com responsibleStudentId = titular (não entidade
  // separada). Vazio = aluno normal. Ver docs/pacotes/ESPECIFICACAO_API_PLANOS_DINAMICOS.md.
  responsibleStudentId?: string | null;
  responsibleName?: string | null;
}

export interface StudentFormData extends AddressFields {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  plan: string;
  status: StudentStatus;
}

export interface StudentHistoryItem {
  date: string;
  className: string;
  status: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Contratos confirmados ao vivo contra a API real em 09/07/2026 (mesmo cuidado da Fase 1
// com teacherAdminService.ts): create/update/deactivate/reactivate retornam o objeto
// Student direto, sem wrapper `data` — só a listagem e o histórico vêm envoltos.
export const studentAdminService = {
  async list(page = 1, pageSize = 20): Promise<{ data: AdminStudent[]; pagination: PaginationMeta }> {
    const res = await api.get<{ data: AdminStudent[]; pagination: PaginationMeta }>('/api/students', {
      params: { page, pageSize },
    });
    return {
      data: res.data.data ?? [],
      pagination: res.data.pagination ?? { page, pageSize, total: 0, totalPages: 0 },
    };
  },

  async getById(id: string): Promise<AdminStudent | undefined> {
    try {
      const res = await api.get<AdminStudent>(`/api/students/${id}`);
      return res.data;
    } catch {
      return undefined;
    }
  },

  async create(data: StudentFormData): Promise<AdminStudent> {
    const res = await api.post<AdminStudent>('/api/students', data);
    return res.data;
  },

  async update(id: string, data: StudentFormData): Promise<AdminStudent> {
    const res = await api.put<AdminStudent>(`/api/students/${id}`, data);
    return res.data;
  },

  // As rotas dedicadas `PATCH /:id/deactivate|reactivate` foram removidas do backend (404,
  // confirmado ao vivo ago/2026 — ver docs/DEMANDA_ACHADOS_TESTES_BACKEND.md). O status agora
  // muda via `PUT /api/students/:id` com `status` (o mesmo que o formulário faz e funciona).
  // Como o PUT não é parcial, buscamos o registro atual e reenviamos os campos + o novo status.
  async setStatus(id: string, status: StudentStatus): Promise<AdminStudent> {
    const cur = await this.getById(id);
    if (!cur) throw new Error('Aluno não encontrado');
    const payload: StudentFormData = {
      name: cur.name,
      email: cur.email,
      phone: cur.phone,
      cpf: cur.cpf ?? '',
      plan: cur.plan ?? '',
      status,
      cep: cur.cep,
      logradouro: cur.logradouro,
      numero: cur.numero,
      complemento: cur.complemento,
      bairro: cur.bairro,
      cidade: cur.cidade,
      estado: cur.estado,
    };
    const res = await api.put<AdminStudent>(`/api/students/${id}`, payload);
    return res.data;
  },

  async deactivate(id: string): Promise<AdminStudent> {
    return this.setStatus(id, 'inactive');
  },

  async reactivate(id: string): Promise<AdminStudent> {
    return this.setStatus(id, 'active');
  },

  async getHistory(id: string): Promise<StudentHistoryItem[]> {
    const res = await api.get<{ data: StudentHistoryItem[] }>(`/api/students/${id}/history`);
    return res.data.data ?? [];
  },
};
