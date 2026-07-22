import { api } from '../../../core/http/api';

// Categoria de pacote (ex.: Básico / Premium / Família). No app admin editamos os campos
// principais (nome, família, ordem, ativo); as regras padrão detalhadas (limites, janelas…)
// são configuradas no ERP (tela larga). Os campos `default*` ficam no tipo pra serem
// PRESERVADOS no update — o `PUT /api/package-types/:id` NÃO é partial (confirmado ao vivo
// 22/07: exige o objeto completo), então mandar só os campos principais apagaria as regras.
export interface AdminPackageType {
  id: string;
  name: string;
  active: boolean;
  isFamily: boolean;
  rank?: number;
  defaultMaxFutureBookings?: number | null;
  defaultMaxBookingsPerDay?: number | null;
  defaultMaxBookingsPerWeek?: number | null;
  defaultMaxBookingsPerMonth?: number | null;
  defaultCancellationDeadlineHours?: number | null;
  defaultBookingWindowDays?: number | null;
  defaultEarlyAccessHours?: number | null;
  defaultAllowWaitlist?: boolean | null;
  defaultReschedulingAllowed?: boolean | null;
  defaultReschedulingDeadlineHours?: number | null;
  defaultNoShowCreditPenalty?: boolean | null;
  defaultMaxNoShowsBeforeBlock?: number | null;
}

export type PackageTypeFormData = Omit<AdminPackageType, 'id'>;

// Listagem envolta em `{data:[...]}`; getById/create/update objeto direto.
export const packageTypeAdminService = {
  async list(): Promise<AdminPackageType[]> {
    const res = await api.get<{ data: AdminPackageType[] }>('/api/package-types');
    return res.data.data ?? [];
  },

  async getById(id: string): Promise<AdminPackageType | undefined> {
    try {
      const res = await api.get<AdminPackageType>(`/api/package-types/${id}`);
      return res.data;
    } catch {
      return undefined;
    }
  },

  async create(data: PackageTypeFormData): Promise<AdminPackageType> {
    const res = await api.post<AdminPackageType>('/api/package-types', data);
    return res.data;
  },

  async update(id: string, data: PackageTypeFormData): Promise<AdminPackageType> {
    const res = await api.put<AdminPackageType>(`/api/package-types/${id}`, data);
    return res.data;
  },
};
