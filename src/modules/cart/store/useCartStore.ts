import { create } from 'zustand';
import { ClassPackage } from '../../../shared/types';

type CartItem = ClassPackage & { quantity: number };

interface CartState {
  items: CartItem[];
  addItem: (item: ClassPackage) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: item =>
    set(state => {
      const exists = state.items.findIndex(i => i.id === item.id);
      if (exists !== -1) {
        return {
          items: state.items.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),
  removeItem: id =>
    set(state => ({ items: state.items.filter(i => i.id !== id) })),
  clearCart: () => set({ items: [] }),
  getTotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
