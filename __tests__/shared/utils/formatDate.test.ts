import { formatDateInput, brDateToISO, isoDateToBR, isValidBRDate } from '../../../src/shared/utils/formatDate';

describe('formatDateInput', () => {
  it('returns raw digits while under 3 characters', () => {
    expect(formatDateInput('1')).toBe('1');
    expect(formatDateInput('10')).toBe('10');
  });

  it('inserts a slash after the day once a 3rd digit is typed', () => {
    expect(formatDateInput('107')).toBe('10/7');
    expect(formatDateInput('1007')).toBe('10/07');
  });

  it('inserts a slash after the month once a 5th digit is typed', () => {
    expect(formatDateInput('100720')).toBe('10/07/20');
    expect(formatDateInput('10072026')).toBe('10/07/2026');
  });

  it('truncates beyond 8 digits', () => {
    expect(formatDateInput('100720261234')).toBe('10/07/2026');
  });
});

describe('brDateToISO', () => {
  it('converts a complete BR date to ISO', () => {
    expect(brDateToISO('10/07/2026')).toBe('2026-07-10');
  });

  it('pads single-digit day/month', () => {
    expect(brDateToISO('5/7/2026')).toBe('2026-07-05');
  });

  it('returns empty string for incomplete input', () => {
    expect(brDateToISO('10/07')).toBe('');
    expect(brDateToISO('')).toBe('');
  });
});

describe('isoDateToBR', () => {
  it('converts an ISO date to BR display format', () => {
    expect(isoDateToBR('2026-07-10')).toBe('10/07/2026');
  });

  it('returns empty string for incomplete input', () => {
    expect(isoDateToBR('2026-07')).toBe('');
    expect(isoDateToBR('')).toBe('');
  });
});

describe('isValidBRDate', () => {
  it('returns true for a real calendar date', () => {
    expect(isValidBRDate('10/07/2026')).toBe(true);
    expect(isValidBRDate('29/02/2028')).toBe(true);
  });

  it('returns false for an invalid day/month combination', () => {
    expect(isValidBRDate('31/04/2026')).toBe(false);
    expect(isValidBRDate('29/02/2026')).toBe(false);
  });

  it('returns false for a month out of range', () => {
    expect(isValidBRDate('10/13/2026')).toBe(false);
    expect(isValidBRDate('10/00/2026')).toBe(false);
  });

  it('returns false for malformed input', () => {
    expect(isValidBRDate('10-07-2026')).toBe(false);
    expect(isValidBRDate('10/07/26')).toBe(false);
    expect(isValidBRDate('')).toBe(false);
  });
});
