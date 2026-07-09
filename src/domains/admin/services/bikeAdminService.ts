import { api } from '../../../core/http/api';

export type BikeStatus = 'available' | 'broken' | 'maintenance';

export interface AdminBike {
  id: string;
  studioId: string;
  number: number;
  status: BikeStatus;
  lastMaintenance: string | null;
  notes: string | null;
}

export interface BikeFormData {
  number: number;
  status: BikeStatus;
  notes?: string;
  lastMaintenance?: string;
}

// Nenhuma tela do ERP consome esse recurso hoje (bikeService.ts/useBikeStore.ts existem
// lá mas não são usados em nenhuma página) — contratos confirmados direto contra a API
// real em 09/07/2026, sem uma tela de referência pra comparar.
export const bikeAdminService = {
  async listByStudio(studioId: string): Promise<AdminBike[]> {
    const res = await api.get<{ data: AdminBike[] }>(`/api/studios/${studioId}/bikes`);
    return res.data.data ?? [];
  },

  async create(studioId: string, data: { number: number; status: BikeStatus }): Promise<AdminBike> {
    const res = await api.post<AdminBike>(`/api/studios/${studioId}/bikes`, data);
    return res.data;
  },

  async update(id: string, data: Partial<BikeFormData>): Promise<AdminBike> {
    const res = await api.put<AdminBike>(`/api/bikes/${id}`, data);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/bikes/${id}`);
  },
};
