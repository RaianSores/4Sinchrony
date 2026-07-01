import {
  detectBrand,
  formatCardNumber,
  formatExpiry,
  formatCVV,
  getLastFour,
  generateMockToken,
  getCVVLength,
  getBrandMaxLength,
} from '../../../src/domains/student/cards/utils/cardUtils';

describe('detectBrand', () => {
  it('detects Visa', () => {
    expect(detectBrand('4111111111111111')).toBe('Visa');
  });

  it('detects Mastercard', () => {
    expect(detectBrand('5111111111111111')).toBe('Mastercard');
    expect(detectBrand('5511111111111111')).toBe('Mastercard');
  });

  it('detects Amex', () => {
    expect(detectBrand('341111111111111')).toBe('Amex');
    expect(detectBrand('371111111111111')).toBe('Amex');
  });

  it('detects Elo', () => {
    expect(detectBrand('5067111111111111')).toBe('Elo');
    expect(detectBrand('5091111111111111')).toBe('Elo');
    expect(detectBrand('6511111111111111')).toBe('Elo');
  });

  it('detects Hipercard', () => {
    expect(detectBrand('6062821111111111')).toBe('Hipercard');
  });

  it('returns Unknown for unrecognized', () => {
    expect(detectBrand('1111111111111111')).toBe('Unknown');
  });
});

describe('formatCardNumber', () => {
  it('formats as 4-digit groups', () => {
    expect(formatCardNumber('4532015112830366')).toBe('4532 0151 1283 0366');
  });

  it('handles partial input', () => {
    expect(formatCardNumber('4532')).toBe('4532');
    expect(formatCardNumber('453201')).toBe('4532 01');
  });

  it('truncates to 16 digits', () => {
    expect(formatCardNumber('45320151128303661234')).toBe('4532 0151 1283 0366');
  });

  it('strips non-digits', () => {
    expect(formatCardNumber('4532-0151-1283-0366')).toBe('4532 0151 1283 0366');
  });
});

describe('formatExpiry', () => {
  it('formats MM/YY', () => {
    expect(formatExpiry('1225')).toBe('12/25');
  });

  it('handles partial input', () => {
    expect(formatExpiry('12')).toBe('12');
  });

  it('strips non-digits', () => {
    expect(formatExpiry('12/25')).toBe('12/25');
  });

  it('truncates to 4 digits', () => {
    expect(formatExpiry('12256')).toBe('12/25');
  });
});

describe('formatCVV', () => {
  it('limits to 3 digits for most brands', () => {
    expect(formatCVV('1234', 'Visa')).toBe('123');
  });

  it('limits to 4 digits for Amex', () => {
    expect(formatCVV('12345', 'Amex')).toBe('1234');
  });

  it('strips non-digits', () => {
    expect(formatCVV('12a3', 'Visa')).toBe('123');
  });
});

describe('getLastFour', () => {
  it('returns last 4 digits', () => {
    expect(getLastFour('4532015112830366')).toBe('0366');
  });

  it('handles formatted input', () => {
    expect(getLastFour('4532 0151 1283 0366')).toBe('0366');
  });
});

describe('generateMockToken', () => {
  it('generates token with brand prefix', () => {
    const token = generateMockToken('Visa', '0366');
    expect(token).toMatch(/^tok_visa_0366_/);
  });
});

describe('getCVVLength', () => {
  it('returns 4 for Amex', () => {
    expect(getCVVLength('Amex')).toBe(4);
  });

  it('returns 3 for other brands', () => {
    expect(getCVVLength('Visa')).toBe(3);
    expect(getCVVLength('Mastercard')).toBe(3);
  });
});

describe('getBrandMaxLength', () => {
  it('returns 15 for Amex', () => {
    expect(getBrandMaxLength('Amex')).toBe(15);
  });

  it('returns 16 for other brands', () => {
    expect(getBrandMaxLength('Visa')).toBe(16);
  });
});
