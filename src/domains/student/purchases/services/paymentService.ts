import { api } from '../../../../core/http/api';
import { Coupon, PaymentResult } from '../../../../shared/types';

export const paymentService = {
  async validateCoupon(code: string): Promise<Coupon | null> {
    const res = await api.post<{ coupon: Coupon | null }>('/payments/validate-coupon', { code });
    return res.data.coupon;
  },

  async processPixPayment(amount: number, packageIds?: string[], couponCode?: string): Promise<PaymentResult> {
    const res = await api.post<PaymentResult>('/payments/pix', { amount, packageIds, couponCode });
    return res.data;
  },

  async processCardPayment(amount: number, cardToken: string, packageIds?: string[], couponCode?: string): Promise<PaymentResult> {
    const res = await api.post<PaymentResult>('/payments/card', { amount, cardToken, packageIds, couponCode });
    return res.data;
  },
};
