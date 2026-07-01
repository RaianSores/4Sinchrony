import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClassPackage, Coupon, Purchase } from '../../../../shared/types';
import { packageService } from '../services/packageService';
import { paymentService } from '../services/paymentService';
import { captureError } from '../../../../lib/sentry';

interface PackageState {
  packages: ClassPackage[];
  cart: (ClassPackage & { quantity: number })[];
  coupon: Coupon | null;
  purchases: Purchase[];
  isLoading: boolean;

  fetchPackages: () => Promise<void>;
  fetchPurchases: () => Promise<void>;
  clearPurchases: () => void;
  addToCart: (pkg: ClassPackage) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  addPurchase: (purchase: Purchase) => void;
}

export const usePackageStore = create<PackageState>()(
  persist(
    (set, get) => ({
      packages: [],
      cart: [],
      coupon: null,
      purchases: [],
      isLoading: false,

      fetchPackages: async () => {
        set({ isLoading: true });
        try {
          const packages = await packageService.getPackages();
          set({ packages, isLoading: false });
        } catch (error) {
          captureError(error);
          set({ isLoading: false });
        }
      },

      fetchPurchases: async () => {
        try {
          const purchases = await paymentService.getPurchases();
          set({ purchases });
        } catch (error) {
          captureError(error);
        }
      },

      clearPurchases: () => set({ purchases: [], cart: [], coupon: null }),

      addToCart: (pkg) =>
        set(state => {
          const exists = state.cart.findIndex(i => i.id === pkg.id);
          if (exists !== -1) {
            return {
              cart: state.cart.map(i =>
                i.id === pkg.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { cart: [...state.cart, { ...pkg, quantity: 1 }] };
        }),

      removeFromCart: (id) =>
        set(state => ({ cart: state.cart.filter(i => i.id !== id) })),

      clearCart: () => set({ cart: [], coupon: null }),

      getCartTotal: () =>
        get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),

      addPurchase: (purchase) =>
        set(state => ({ purchases: [purchase, ...state.purchases] })),
    }),
    {
      name: 'package-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cart: state.cart,
        coupon: state.coupon,
        purchases: state.purchases,
      }),
    }
  )
);
