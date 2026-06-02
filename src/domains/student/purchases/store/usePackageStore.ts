import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClassPackage, Coupon, Purchase } from '../../../../shared/types';
import { packageService } from '../services/packageService';
import { paymentService } from '../services/paymentService';

interface PackageState {
  packages: ClassPackage[];
  cart: (ClassPackage & { quantity: number })[];
  coupon: Coupon | null;
  purchases: Purchase[];
  isLoading: boolean;

  fetchPackages: () => Promise<void>;
  addToCart: (pkg: ClassPackage) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<Coupon | null>;
  removeCoupon: () => void;
  getCartTotal: () => number;
  getDiscountedTotal: () => number;
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
        } catch {
          set({ isLoading: false });
        }
      },

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

      applyCoupon: async (code) => {
        const coupon = await paymentService.validateCoupon(code);
        if (coupon) set({ coupon });
        return coupon;
      },

      removeCoupon: () => set({ coupon: null }),

      getCartTotal: () =>
        get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getDiscountedTotal: () => {
        const total = get().getCartTotal();
        const coupon = get().coupon;
        if (!coupon) return total;
        if (coupon.discountType === 'percentage') {
          return total - (total * coupon.discount) / 100;
        }
        return Math.max(0, total - coupon.discount);
      },

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
