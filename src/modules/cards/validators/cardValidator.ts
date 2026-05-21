import { CardBrand } from '../../../shared/types';

export function isValidLuhn(number: string): boolean {
  const digits = number.replace(/\s/g, '');
  if (!/^\d+$/.test(digits)) return false;

  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

export function isValidCardNumber(number: string, brand: CardBrand): boolean {
  const digits = number.replace(/\s/g, '');

  if (!/^\d+$/.test(digits)) return false;

  const lengthRules: Record<CardBrand, number[]> = {
    Visa: [13, 16, 19],
    Mastercard: [16],
    Amex: [15],
    Elo: [16],
    Hipercard: [13, 16],
    Unknown: [13, 14, 15, 16, 17, 18, 19],
  };

  const allowedLengths = lengthRules[brand];
  if (!allowedLengths.includes(digits.length)) return false;

  return isValidLuhn(digits);
}

export function isValidExpiry(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

export function isValidCVV(value: string, brand: CardBrand): boolean {
  const length = brand === 'Amex' ? 4 : 3;
  return /^\d+$/.test(value) && value.length === length;
}

export function isValidHolderName(value: string): boolean {
  return value.trim().length >= 2;
}
