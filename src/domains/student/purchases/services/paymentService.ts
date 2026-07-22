import { api } from '../../../../core/http/api';
import { PaymentResult, Purchase } from '../../../../shared/types';

export const paymentService = {
  async processPixPayment(amount: number, packageIds?: string[], couponCode?: string): Promise<PaymentResult> {
    const res = await api.post<PaymentResult>('/payments/pix', { amount, packageIds, couponCode });
    console.log('processPixPayment response:', JSON.stringify(res.data, null, 2)); // Log the response for debugging
    return res.data;
  },

  async processCardPayment(amount: number, cardToken: string, packageIds?: string[], couponCode?: string): Promise<PaymentResult> {
    const res = await api.post<PaymentResult>('/payments/card', { amount, cardToken, packageIds, couponCode });
    return res.data;
  },

  async getPurchases(): Promise<Purchase[]> {
    const res = await api.get<{ data: any[] }>('/purchases');
    return res.data.data ?? [];
  },
};
