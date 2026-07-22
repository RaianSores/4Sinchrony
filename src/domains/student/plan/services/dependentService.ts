import { api } from '../../../../core/http/api';

// Dependentes do aluno titular (pacote família). Shape confirmado ao vivo 22/07/2026:
// list envolto em `{data:[...]}`; create/update objeto direto; delete `{success:true}`.
export interface Dependent {
  id: string;
  name: string;
  birthDate?: string | null;
  cpf?: string | null;
  canBook: boolean;
  canCancel: boolean;
  canViewHistory: boolean;
  active: boolean;
  createdAt: string;
}

export interface DependentFormData {
  name: string;
  birthDate?: string;
  cpf?: string;
  canBook: boolean;
  canCancel: boolean;
  canViewHistory: boolean;
  active: boolean;
}

export const dependentService = {
  async list(): Promise<Dependent[]> {
    const res = await api.get<{ data: Dependent[] } | Dependent[]>('/students/me/dependents');
    const body = res.data as any;
    return Array.isArray(body) ? body : (body?.data ?? []);
  },

  async create(data: DependentFormData): Promise<Dependent> {
    const res = await api.post<Dependent>('/students/me/dependents', data);
    return res.data;
  },

  async update(id: string, data: DependentFormData): Promise<Dependent> {
    const res = await api.put<Dependent>(`/students/me/dependents/${id}`, data);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/students/me/dependents/${id}`);
  },
};
