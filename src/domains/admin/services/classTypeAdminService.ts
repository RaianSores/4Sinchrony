import { api } from '../../../core/http/api';

export interface AdminClassType {
  id: string;
  name: string;
  active: boolean;
  usesBikes?: boolean;
}

export interface ClassTypeFormData {
  name: string;
  active: boolean;
  usesBikes?: boolean;
}

// Contratos confirmados ao vivo em 09/07/2026: list (`GET /api/class-types`) vem envolto em
// `{data:[...]}`; getById/create/update retornam o objeto direto (sem wrapper) — diferente do
// que o `classTypeService.ts` do ERP assume (ele trata create/update como envoltos em `{data}`,
// mas a API real não envolve). Não existe endpoint de exclusão (DELETE responde 405) — só dá
// pra desativar via `update` com `active:false`. O campo `usesBikes` ainda não é persistido
// pelo backend (ver docs/DEMANDA_CLASSTYPE_BIKE_FLAG_BACKEND.md, confirmado ainda aberto) —
// mandamos e lemos mesmo assim, já pronto pra funcionar quando o backend implementar.
export const classTypeAdminService = {
  async list(): Promise<AdminClassType[]> {
    const res = await api.get<{ data: AdminClassType[] }>('/api/class-types');
    return res.data.data ?? [];
  },

  async getById(id: string): Promise<AdminClassType | undefined> {
    try {
      const res = await api.get<AdminClassType>(`/api/class-types/${id}`);
      return res.data;
    } catch {
      return undefined;
    }
  },

  async create(data: ClassTypeFormData): Promise<AdminClassType> {
    const res = await api.post<AdminClassType>('/api/class-types', data);
    return res.data;
  },

  async update(id: string, data: ClassTypeFormData): Promise<AdminClassType> {
    const res = await api.put<AdminClassType>(`/api/class-types/${id}`, data);
    return res.data;
  },
};
