import { Coupon, PaymentResult } from '../../../shared/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const validCoupons: Coupon[] = [
  { code: 'WELCOME10', discount: 10, discountType: 'percentage' },
  { code: 'FRIEND20', discount: 20, discountType: 'fixed' },
];

export const paymentService = {
  async validateCoupon(code: string): Promise<Coupon | null> {
    await delay(500);
    const coupon = validCoupons.find(
      c => c.code.toUpperCase() === code.toUpperCase()
    );
    return coupon || null;
  },

  async processPixPayment(_amount: number): Promise<PaymentResult> {
    await delay(1500);
    return {
      success: true,
      transactionId: 'pix_' + Date.now(),
      message: 'Pagamento PIX processado com sucesso',
      pixCode: '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-426614174000',
      pixQRCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    };
  },

  async processCardPayment(_amount: number, _cardToken: string): Promise<PaymentResult> {
    await delay(2000);
    return {
      success: true,
      transactionId: 'card_' + Date.now(),
      message: 'Pagamento no cartão aprovado!',
    };
  },
};
