import { api } from '../../../core/http/api';

// Unidade = o prédio/filial (Unidade → Studios → Aulas). Ver
// docs/DEMANDA_MODELO_UNIDADE_STUDIO_BACKEND.md. `GET /api/units` já existe (só admin global).
export interface AdminUnit {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  openingTime?: string;
  closingTime?: string;
  active: boolean;
  studiosCount?: number;
}

export const unitAdminService = {
  async list(): Promise<AdminUnit[]> {
    const res = await api.get<{ data: AdminUnit[] } | AdminUnit[]>('/api/units');
    const body = res.data as any;
    return Array.isArray(body) ? body : (body?.data ?? []);
  },
};
