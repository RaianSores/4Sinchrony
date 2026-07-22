import { api } from '../../../../core/http/api';
import { CardInfo, AddCardData } from '../../../../shared/types';

// Convenção confirmada ao vivo 22/07/2026: `GET /cards` vem envolto em `{data:[...]}`, mas
// `POST /cards` e `PUT /cards/:id/default` retornam o valor DIRETO (objeto / array), sem
// wrapper `data` — mesmo padrão inconsistente já visto em vários outros recursos da API. Antes,
// `addCard` lia `res.data.data` (undefined) e devolvia `undefined`, que entrava no store e
// derrubava MyCardsScreen (`Cannot read property 'id' of undefined`) e AddCardScreen
// (`'duplicate' in undefined`). Lemos os dois formatos defensivamente.
export const cardService = {
  async getCards(): Promise<CardInfo[]> {
    const res = await api.get<{ data?: CardInfo[] }>('/cards');
    const d = res.data as unknown;
    return (Array.isArray(d) ? d : (res.data?.data ?? [])) as CardInfo[];
  },

  async addCard(data: AddCardData): Promise<CardInfo> {
    const res = await api.post<{ data?: CardInfo }>('/cards', {
      number: data.number,
      holderName: data.holderName,
      expiryDate: data.expiryDate,
      cvv: data.cvv,
      nickname: data.nickname,
    });
    return (res.data?.data ?? res.data) as CardInfo;
  },

  async removeCard(id: string): Promise<void> {
    await api.delete(`/cards/${id}`);
  },

  async setDefaultCard(id: string): Promise<CardInfo[]> {
    const res = await api.put<{ data?: CardInfo[] }>(`/cards/${id}/default`);
    const d = res.data as unknown;
    return (Array.isArray(d) ? d : (res.data?.data ?? [])) as CardInfo[];
  },
};
