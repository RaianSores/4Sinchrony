import { CardInfo, AddCardData, CardBrand } from '../../../../shared/types';
import { detectBrand, getLastFour, generateMockToken } from '../utils/cardUtils';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockCards: CardInfo[] = [
  {
    id: 'card_1',
    lastDigits: '4589',
    brand: 'Visa',
    holderName: 'Raian Soares',
    expiryDate: '12/28',
    isDefault: true,
    nickname: 'Meu Visa',
    token: 'tok_visa_4589_mock_abc123',
  },
  {
    id: 'card_2',
    lastDigits: '1123',
    brand: 'Mastercard',
    holderName: 'Raian Soares',
    expiryDate: '08/27',
    isDefault: false,
    token: 'tok_master_1123_mock_def456',
  },
];

let nextId = 3;

export const cardService = {
  async getCards(): Promise<CardInfo[]> {
    await delay(300);
    return [...mockCards];
  },

  async addCard(data: AddCardData): Promise<CardInfo> {
    await delay(500);

    const brand: CardBrand = detectBrand(data.number);
    const last4 = getLastFour(data.number);
    const token = generateMockToken(brand, last4);
    const isDefault = mockCards.length === 0;

    const newCard: CardInfo = {
      id: `card_${nextId++}`,
      lastDigits: last4,
      brand,
      holderName: data.holderName.trim(),
      expiryDate: data.expiryDate,
      isDefault,
      nickname: data.nickname?.trim() || undefined,
      token,
    };

    mockCards = [...mockCards, newCard];
    return newCard;
  },

  async removeCard(id: string): Promise<void> {
    await delay(200);
    mockCards = mockCards.filter(c => c.id !== id);
  },

  async setDefaultCard(id: string): Promise<CardInfo[]> {
    await delay(200);
    mockCards = mockCards.map(c => ({
      ...c,
      isDefault: c.id === id,
    }));
    return [...mockCards];
  },
};
