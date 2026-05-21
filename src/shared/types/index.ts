export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  credits: number;
  phone?: string;
}

export interface Studio {
  id: string;
  name: string;
  city: string;
  address: string;
}

export interface Class {
  id: string;
  name: string;
  type: string;
  instructor: string;
  instructorAvatar?: string;
  startTime: string;
  duration: number;
  studio: Studio;
  availableSpots: number;
  totalSpots: number;
  date: string;
  bikes?: Bike[];
}

export interface Bike {
  number: number;
  status: 'available' | 'occupied';
}

export interface Booking {
  id: string;
  class: Class;
  bikeNumber?: number;
  status: 'confirmed' | 'cancelled';
  bookedAt: string;
}

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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

export interface ReferralInfo {
  code: string;
  url: string;
  totalReferrals: number;
  totalCreditsEarned: number;
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

export interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  preferences: NotificationPreference[];
}
