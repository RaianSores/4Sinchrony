import { api } from '../../../core/http/api';

// Unidade = o prédio/filial (Unidade → Studios → Aulas). Ver
// docs/DEMANDA_MODELO_UNIDADE_STUDIO_BACKEND.md. Endereço estruturado (cep, logradouro…)
// liberado pelo backend em 24/07. Como o studio deriva o endereço da unidade, o cadastro
// da unidade tem os mesmos campos do cadastro de aluno/professor (CEP + ViaCEP).
export interface AdminUnit {
  id: string;
  name: string;
  address?: string; // string composta legada (o backend ainda usa `address`)
  phone?: string;
  email?: string;
  active: boolean;
  studiosCount?: number;
  // Endereço estruturado
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface UnitFormPayload {
  name: string;
  phone?: string;
  email?: string;
  active?: boolean;
  address?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

// A listagem (`GET /api/units`) vem envolta em `{ data: [...] }`; o item único
// (`GET /api/units/:id`), o POST e o PUT retornam o objeto Unit direto (sem wrapper).
export const unitAdminService = {
  async list(): Promise<AdminUnit[]> {
    const res = await api.get<{ data: AdminUnit[] } | AdminUnit[]>('/api/units');
    const body = res.data as any;
    return Array.isArray(body) ? body : (body?.data ?? []);
  },

  async getById(id: string): Promise<AdminUnit | undefined> {
    try {
      const res = await api.get<AdminUnit>(`/api/units/${id}`);
      return res.data;
    } catch {
      return undefined;
    }
  },

  async create(data: UnitFormPayload): Promise<AdminUnit> {
    const res = await api.post<AdminUnit>('/api/units', data);
    return res.data;
  },

  async update(id: string, data: UnitFormPayload): Promise<AdminUnit> {
    const res = await api.put<AdminUnit>(`/api/units/${id}`, data);
    return res.data;
  },
};
