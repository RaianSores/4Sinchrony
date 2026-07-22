import { api } from '../../../core/http/api';

// Benefício informativo associável a pacotes (sauna, estacionamento, etc.).
export interface AdminBenefit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
}

export type BenefitFormData = Omit<AdminBenefit, 'id'>;

// Listagem envolta em `{data:[...]}`; create/update objeto direto.
export const benefitAdminService = {
  async list(): Promise<AdminBenefit[]> {
    const res = await api.get<{ data: AdminBenefit[] }>('/api/benefits');
    return res.data.data ?? [];
  },

  async create(data: BenefitFormData): Promise<AdminBenefit> {
    const res = await api.post<AdminBenefit>('/api/benefits', data);
    return res.data;
  },

  async update(id: string, data: BenefitFormData): Promise<AdminBenefit> {
    const res = await api.put<AdminBenefit>(`/api/benefits/${id}`, data);
    return res.data;
  },
};
