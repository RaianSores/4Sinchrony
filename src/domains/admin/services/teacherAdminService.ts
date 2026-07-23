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

  async activate(id: string): Promise<void> {
    await api.patch(`/api/teachers/${id}/activate`);
  },

  async deactivate(id: string): Promise<void> {
    await api.patch(`/api/teachers/${id}/deactivate`);
  },

  async sendTemporaryPassword(id: string): Promise<string> {
    const res = await api.post<{ success: boolean; message: string; temporaryPassword: string }>(
      `/api/teachers/${id}/send-password`
    );
    return res.data.temporaryPassword;
  },
};
