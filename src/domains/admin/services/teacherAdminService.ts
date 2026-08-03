import { api } from '../../../core/http/api';

export interface AdminTeacher {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  phone: string;
  active: boolean;
  unitIds?: string[];
  units?: { id: string; name: string }[];
  avatar: string | null;
  specialties: string[];
  // Endereço estruturado (backend liberou 24/07).
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  specialties: string[];
}

// Contratos confirmados ao vivo contra a API real em 09/07/2026 (ver
// docs/PLANO_ADMIN_APP.md e docs/DEMANDA_CPF_DUPLICADO_500_BACKEND.md): ao contrário do
// `teacherService.ts` do ERP, que espera `res.data.data` em create/update/activate/
// deactivate, a API retorna o objeto Teacher direto (sem wrapper `data`) nesses
// endpoints — só a listagem (`GET /api/teachers`) vem envolta em `{ data: [...] }`.
export const teacherAdminService = {
  async list(): Promise<AdminTeacher[]> {
    const res = await api.get<{ data: AdminTeacher[] }>('/api/teachers');
    return res.data.data ?? [];
  },

  async getById(id: string): Promise<AdminTeacher | undefined> {
    try {
      const res = await api.get<AdminTeacher>(`/api/teachers/${id}`);
      return res.data;
    } catch {
      return undefined;
    }
  },

  async create(data: TeacherFormData & { password: string }): Promise<AdminTeacher> {
    const res = await api.post<AdminTeacher>('/api/teachers', {
      ...data,
      cpf: data.cpf ?? '',
    });
    return res.data;
  },

  async update(id: string, data: TeacherFormData): Promise<AdminTeacher> {
    const res = await api.put<AdminTeacher>(`/api/teachers/${id}`, {
      ...data,
      cpf: data.cpf ?? '',
    });
    return res.data;
  },

  // As rotas `PATCH /:id/activate|deactivate` foram removidas do backend (404, confirmado ao
  // vivo ago/2026 — ver docs/DEMANDA_ACHADOS_TESTES_BACKEND.md). O status muda via `PUT
  // /api/teachers/:id` com `active` (testado, funciona). PUT não é parcial, então buscamos o
  // registro atual e reenviamos os campos + o novo `active`.
  async setActive(id: string, active: boolean): Promise<AdminTeacher> {
    const cur = await this.getById(id);
    if (!cur) throw new Error('Professor não encontrado');
    const res = await api.put<AdminTeacher>(`/api/teachers/${id}`, {
      name: cur.name,
      email: cur.email,
      phone: cur.phone,
      cpf: cur.cpf ?? '',
      active,
      specialties: cur.specialties ?? [],
      unitIds: cur.unitIds ?? (cur.units?.map(u => u.id) ?? []),
      cep: cur.cep,
      logradouro: cur.logradouro,
      numero: cur.numero,
      complemento: cur.complemento,
      bairro: cur.bairro,
      cidade: cur.cidade,
      estado: cur.estado,
    });
    return res.data;
  },

  async activate(id: string): Promise<void> {
    await this.setActive(id, true);
  },

  async deactivate(id: string): Promise<void> {
    await this.setActive(id, false);
  },

  async sendTemporaryPassword(id: string): Promise<string> {
    const res = await api.post<{ success: boolean; message: string; temporaryPassword: string }>(
      `/api/teachers/${id}/send-password`
    );
    return res.data.temporaryPassword;
  },
};
