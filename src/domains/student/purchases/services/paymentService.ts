import { PAYMENT_MOCK } from '@env';
import { api } from '../../../../core/http/api';
import { /* Coupon, */ PaymentResult, Purchase } from '../../../../shared/types'; // Coupon: FEATURE (paid add-on)

const isMock = PAYMENT_MOCK === 'true';

const mockDelay = () => new Promise(r => setTimeout(r, 1200));

const mockPix: PaymentResult = {
  success: true,
  transactionId: 'mock_pix_' + Date.now(),
  message: 'PIX gerado com sucesso (mock)',
  pixCode: '00020126580014BR.GOV.BCB.PIX0136mock-key-uuid-1234-5678-9012-3456789012345204000053039865802BR5925Studio Wellness Mock6009SAO PAULO62070503***6304MOCK',
  pixQRCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MOCK_PIX_CODE',
};

const mockCard: PaymentResult = {
  success: true,
  transactionId: 'mock_card_' + Date.now(),
  message: 'Pagamento aprovado (mock)',
};

export const paymentService = {
  // FEATURE: coupon (paid add-on)
  // async validateCoupon(code: string): Promise<Coupon | null> {
  //   if (isMock) {
  //     await mockDelay();
  //     if (code.toUpperCase() === 'MOCK10') return { code: 'MOCK10', discount: 10, discountType: 'percentage' };
  //     if (code.toUpperCase() === 'MOCK20') return { code: 'MOCK20', discount: 20, discountType: 'fixed' };
  //     return null;
  //   }
  //   const res = await api.post<{ coupon: Coupon | null }>('/payments/validate-coupon', { code });
  //   return res.data.coupon;
  // },

  async processPixPayment(amount: number, packageIds?: string[], couponCode?: string): Promise<PaymentResult> {
    if (isMock) {
      await mockDelay();
      return { ...mockPix, transactionId: 'mock_pix_' + Date.now() };
    }
    const res = await api.post<PaymentResult>('/payments/pix', { amount, packageIds, couponCode });
    return res.data;
  },

  async processCardPayment(amount: number, cardToken: string, packageIds?: string[], couponCode?: string): Promise<PaymentResult> {
    if (isMock) {
      await mockDelay();
      return { ...mockCard, transactionId: 'mock_card_' + Date.now() };
    }
    const res = await api.post<PaymentResult>('/payments/card', { amount, cardToken, packageIds, couponCode });
    return res.data;
  },

  async getPurchases(): Promise<Purchase[]> {
    const res = await api.get<{ data: any[] }>('/purchases');
    return res.data.data ?? [];
  },
};
