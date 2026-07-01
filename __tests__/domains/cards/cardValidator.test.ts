import {
  isValidLuhn,
  isValidCardNumber,
  isValidExpiry,
  isValidCVV,
  isValidHolderName,
} from '../../../src/domains/student/cards/validators/cardValidator';

describe('isValidLuhn', () => {
  it('returns true for valid Luhn numbers', () => {
    expect(isValidLuhn('4532015112830366')).toBe(true);
    expect(isValidLuhn('5555555555554444')).toBe(true);
    expect(isValidLuhn('378282246310005')).toBe(true);
  });

  it('returns false for invalid Luhn numbers', () => {
    expect(isValidLuhn('1234567890123456')).toBe(false);
  });

  it('returns false for non-numeric input', () => {
    expect(isValidLuhn('abcd')).toBe(false);
  });

  it('handles formatted input with spaces', () => {
    expect(isValidLuhn('4532 0151 1283 0366')).toBe(true);
  });
});

describe('isValidCardNumber', () => {
  it('validates Visa', () => {
    expect(isValidCardNumber('4532015112830366', 'Visa')).toBe(true);
    expect(isValidCardNumber('4532015112830', 'Visa')).toBe(true);
  });

  it('validates Amex', () => {
    expect(isValidCardNumber('378282246310005', 'Amex')).toBe(true);
    expect(isValidCardNumber('37828224631000', 'Amex')).toBe(false);
  });

  it('validates Mastercard', () => {
    expect(isValidCardNumber('5555555555554444', 'Mastercard')).toBe(true);
  });

  it('rejects wrong length for brand', () => {
    expect(isValidCardNumber('453201511283', 'Visa')).toBe(false);
  });
});

describe('isValidExpiry', () => {
  it('validates future date', () => {
    const futureYear = String(new Date().getFullYear() + 1).slice(-2);
    expect(isValidExpiry(`12/${futureYear}`)).toBe(true);
  });

  it('rejects past date', () => {
    expect(isValidExpiry('01/20')).toBe(false);
  });

  it('rejects invalid month', () => {
    const futureYear = String(new Date().getFullYear() + 1).slice(-2);
    expect(isValidExpiry(`13/${futureYear}`)).toBe(false);
    expect(isValidExpiry(`00/${futureYear}`)).toBe(false);
  });

  it('rejects invalid format', () => {
    expect(isValidExpiry('1212')).toBe(false);
    expect(isValidExpiry('')).toBe(false);
  });
});

describe('isValidCVV', () => {
  it('validates 3-digit CVV for most brands', () => {
    expect(isValidCVV('123', 'Visa')).toBe(true);
    expect(isValidCVV('123', 'Mastercard')).toBe(true);
  });

  it('validates 4-digit CVV for Amex', () => {
    expect(isValidCVV('1234', 'Amex')).toBe(true);
    expect(isValidCVV('123', 'Amex')).toBe(false);
  });

  it('rejects non-numeric CVV', () => {
    expect(isValidCVV('abc', 'Visa')).toBe(false);
  });
});

describe('isValidHolderName', () => {
  it('validates names with 2+ chars', () => {
    expect(isValidHolderName('João')).toBe(true);
  });

  it('rejects empty or single char', () => {
    expect(isValidHolderName('')).toBe(false);
    expect(isValidHolderName('A')).toBe(false);
  });
});
