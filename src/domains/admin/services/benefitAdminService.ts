import { api } from '../../../core/http/api';

// Benefício informativo associável a pacotes. Criação/edição fica no ERP; o App só lê pra
// popular a seleção no formulário de pacote.
export interface AdminBenefit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
}

export const benefitAdminService = {
  async list(): Promise<AdminBenefit[]> {
    const res = await api.get<{ data: AdminBenefit[] }>('/api/benefits');
    return res.data.data ?? [];
  },
};
