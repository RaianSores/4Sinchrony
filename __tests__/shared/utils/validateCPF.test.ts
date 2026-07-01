import { validateCPF, formatCPF, cleanCPF } from '../../../src/shared/utils/validateCPF';

describe('cleanCPF', () => {
  it('removes non-digit characters', () => {
    expect(cleanCPF('123.456.789-00')).toBe('12345678900');
  });

  it('returns empty string for empty input', () => {
    expect(cleanCPF('')).toBe('');
  });

  it('preserves only digits', () => {
    expect(cleanCPF('abc123def456')).toBe('123456');
  });
});

describe('formatCPF', () => {
  it('formats 11 digits correctly', () => {
    expect(formatCPF('12345678900')).toBe('123.456.789-00');
  });

  it('formats partial input progressively', () => {
    expect(formatCPF('123')).toBe('123');
    expect(formatCPF('123456')).toBe('123.456');
    expect(formatCPF('123456789')).toBe('123.456.789');
  });

  it('handles already formatted input', () => {
    expect(formatCPF('123.456.789-00')).toBe('123.456.789-00');
  });

  it('truncates to 11 digits', () => {
    expect(formatCPF('12345678900123')).toBe('123.456.789-00');
  });
});

describe('validateCPF', () => {
  it('returns true for valid CPF', () => {
    expect(validateCPF('529.982.247-25')).toBe(true);
    expect(validateCPF('52998224725')).toBe(true);
  });

  it('returns true for another valid CPF', () => {
    expect(validateCPF('111.444.777-35')).toBe(true);
  });

  it('returns false for CPF with all same digits', () => {
    expect(validateCPF('111.111.111-11')).toBe(false);
    expect(validateCPF('222.222.222-22')).toBe(false);
    expect(validateCPF('000.000.000-00')).toBe(false);
  });

  it('returns false for invalid check digits', () => {
    expect(validateCPF('529.982.247-24')).toBe(false);
    expect(validateCPF('111.444.777-36')).toBe(false);
  });

  it('returns false for CPF with wrong length', () => {
    expect(validateCPF('123.456.789')).toBe(false);
    expect(validateCPF('')).toBe(false);
  });

  it('returns false for non-numeric input', () => {
    expect(validateCPF('abc.def.ghi-jk')).toBe(false);
  });
});
