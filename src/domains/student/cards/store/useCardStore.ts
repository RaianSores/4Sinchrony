import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardInfo, AddCardData } from '../../../../shared/types';
import { cardService } from '../services/cardService';
import { getLastFour } from '../utils/cardUtils';
import { captureError } from '../../../../lib/sentry';

interface CardState {
  cards: CardInfo[];
  isLoading: boolean;

  fetchCards: () => Promise<void>;
  addCard: (data: AddCardData) => Promise<CardInfo | { duplicate: true; existing: CardInfo }>;
  removeCard: (id: string) => { canRemove: boolean; message?: string };
  confirmRemoveCard: (id: string) => Promise<void>;
  setDefaultCard: (id: string) => Promise<void>;
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      cards: [],
      isLoading: false,

      fetchCards: async () => {
        set({ isLoading: true });
        try {
          const cards = await cardService.getCards();
          set({ cards, isLoading: false });
        } catch (error) {
          captureError(error);
          set({ isLoading: false });
        }
      },

      addCard: async (data) => {
        const last4 = getLastFour(data.number);
        const existing = get().cards.find(
          c => c.lastDigits === last4 && c.expiryDate === data.expiryDate && c.holderName.toUpperCase() === data.holderName.trim().toUpperCase()
        );
        if (existing) {
          return { duplicate: true, existing };
        }

        const newCard = await cardService.addCard(data);
        set(state => ({ cards: [...state.cards, newCard] }));
        return newCard;
      },

      removeCard: (id) => {
        const { cards } = get();
        const card = cards.find(c => c.id === id);
        if (!card) return { canRemove: false, message: 'Cartão não encontrado' };

        const hasOnlyOneDefault = cards.length === 1 && card.isDefault;
        if (hasOnlyOneDefault) {
          return {
            canRemove: false,
            message: 'Mantenha ao menos um cartão principal para futuras assinaturas',
          };
        }

        return { canRemove: true };
      },

      confirmRemoveCard: async (id) => {
        await cardService.removeCard(id);
        set(state => {
          const remaining = state.cards.filter(c => c.id !== id);
          const wasDefault = state.cards.find(c => c.id === id)?.isDefault;
          if (wasDefault && remaining.length > 0) {
            remaining[0].isDefault = true;
          }
          return { cards: remaining };
        });
      },

      setDefaultCard: async (id) => {
        const updated = await cardService.setDefaultCard(id);
        set({ cards: updated });
      },
    }),
    {
      name: 'card-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cards: state.cards,
      }),
    }
  )
);
