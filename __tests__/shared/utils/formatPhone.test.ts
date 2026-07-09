import { formatPhone, cleanPhone } from '../../../src/shared/utils/formatPhone';

describe('cleanPhone', () => {
  it('removes non-digit characters', () => {
    expect(cleanPhone('(11) 99999-0000')).toBe('11999990000');
  });

  it('truncates to 11 digits', () => {
    expect(cleanPhone('119999900001234')).toBe('11999990000');
  });

  it('returns empty string for empty input', () => {
    expect(cleanPhone('')).toBe('');
  });
});

describe('formatPhone', () => {
  it('formats progressively as digits are typed', () => {
    expect(formatPhone('1')).toBe('1');
    expect(formatPhone('11')).toBe('11');
    expect(formatPhone('119')).toBe('(11) 9');
    expect(formatPhone('1199999')).toBe('(11) 9999-9');
  });

  it('reformats from 4+4 to 5+4 split once the 9th mobile digit is typed', () => {
    expect(formatPhone('1199999000')).toBe('(11) 9999-9000');
    expect(formatPhone('11999990000')).toBe('(11) 99999-0000');
  });

  it('formats an 11-digit mobile number', () => {
    expect(formatPhone('11999990000')).toBe('(11) 99999-0000');
  });

  it('formats a 10-digit landline number', () => {
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
  });

  it('handles already formatted input', () => {
    expect(formatPhone('(11) 99999-0000')).toBe('(11) 99999-0000');
  });

  it('truncates beyond 11 digits', () => {
    expect(formatPhone('11999990000999')).toBe('(11) 99999-0000');
  });
});
