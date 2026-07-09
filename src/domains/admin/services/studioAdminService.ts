import { api } from '../../../core/http/api';

export interface AdminStudio {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
  capacity: number;
  openingTime: string;
  closingTime: string;
}

export interface StudioFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  openingTime: string;
  closingTime: string;
}

// Contratos confirmados ao vivo em 09/07/2026: list vem envolto em `{data:[...]}`;
// getById/create/update retornam o objeto direto (sem wrapper); mas — diferente de
// professores e alunos — activate/deactivate aqui só retornam `{success:true}`, sem o
// objeto atualizado, então quem chama precisa atualizar o estado local de forma otimista.
export const studioAdminService = {
  async list(): Promise<AdminStudio[]> {
    const res = await api.get<{ data: AdminStudio[] }>('/api/studios');
    return res.data.data ?? [];
  },

  async getById(id: string): Promise<AdminStudio | undefined> {
    try {
      const res = await api.get<AdminStudio>(`/api/studios/${id}`);
      return res.data;
    } catch {
      return undefined;
    }
  },

  async create(data: StudioFormData): Promise<AdminStudio> {
    const res = await api.post<AdminStudio>('/api/studios', { ...data, active: true });
    return res.data;
  },

  async update(id: string, data: StudioFormData): Promise<AdminStudio> {
    const res = await api.put<AdminStudio>(`/api/studios/${id}`, data);
    return res.data;
  },

  async activate(id: string): Promise<void> {
    await api.patch(`/api/studios/${id}/activate`);
  },

  async deactivate(id: string): Promise<void> {
    await api.patch(`/api/studios/${id}/deactivate`);
  },
};
