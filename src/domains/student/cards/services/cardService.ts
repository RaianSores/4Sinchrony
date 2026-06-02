import { api } from '../../../../core/http/api';
import { CardInfo, AddCardData } from '../../../../shared/types';

export const cardService = {
  async getCards(): Promise<CardInfo[]> {
    const res = await api.get<{ data: CardInfo[] }>('/cards');
    return res.data.data ?? [];
  },

  async addCard(data: AddCardData): Promise<CardInfo> {
    const res = await api.post<{ data: CardInfo }>('/cards', {
      number: data.number,
      holderName: data.holderName,
      expiryDate: data.expiryDate,
      cvv: data.cvv,
      nickname: data.nickname,
    });
    return res.data.data;
  },

  async removeCard(id: string): Promise<void> {
    await api.delete(`/cards/${id}`);
  },

  async setDefaultCard(id: string): Promise<CardInfo[]> {
    const res = await api.put<{ data: CardInfo[] }>(`/cards/${id}/default`);
    return res.data.data ?? [];
  },
};
