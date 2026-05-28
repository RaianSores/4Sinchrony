import { CardBrand } from '../../../shared/types';

export function detectBrand(number: string): CardBrand {
  const sanitized = number.replace(/\s/g, '');

  if (/^4/.test(sanitized)) return 'Visa';
  if (/^5[1-5]/.test(sanitized)) return 'Mastercard';
  if (/^3[47]/.test(sanitized)) return 'Amex';
  if (/^6(?:011|5)/.test(sanitized) || /^506[7-9]/.test(sanitized) || /^509/.test(sanitized)) return 'Elo';
  if (/^606282|^3841(?:0|100)/.test(sanitized)) return 'Hipercard';

  return 'Unknown';
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  return groups.join(' ');
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  return digits;
}

export function formatCVV(value: string, brand: CardBrand): string {
  const maxLength = brand === 'Amex' ? 4 : 3;
  return value.replace(/\D/g, '').slice(0, maxLength);
}

export function getLastFour(number: string): string {
  const digits = number.replace(/\s/g, '');
  return digits.slice(-4);
}

export function generateMockToken(brand: CardBrand, last4: string): string {
  const prefix = brand.toLowerCase();
  const random = Math.random().toString(36).substring(2, 8);
  return `tok_${prefix}_${last4}_${random}`;
}

export function getCVVLength(brand: CardBrand): number {
  return brand === 'Amex' ? 4 : 3;
}

export function getBrandMaxLength(brand: CardBrand): number {
  if (brand === 'Amex') return 15;
  return 16;
}
