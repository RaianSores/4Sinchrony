export interface ClassPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  validityDays: number;
  popular?: boolean;
}

export interface Coupon {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
}

export interface Purchase {
  id: string;
  package: ClassPackage;
  amount: number;
  coupon?: Coupon | null;
  paymentMethod: 'pix' | 'card';
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
  pixCode?: string;
  pixQRCode?: string;
}

export type CardBrand = 'Visa' | 'Mastercard' | 'Amex' | 'Elo' | 'Hipercard' | 'Unknown';

export interface CardInfo {
  id: string;
  lastDigits: string;
  brand: CardBrand;
  holderName: string;
  expiryDate: string;
  isDefault: boolean;
  nickname?: string;
  token: string;
}

export interface AddCardData {
  number: string;
  holderName: string;
  expiryDate: string;
  cvv: string;
  nickname?: string;
}
