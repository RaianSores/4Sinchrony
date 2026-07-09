import { formatTime, addMinutesToTime } from '../../../src/shared/utils/formatTime';

describe('formatTime', () => {
  it('returns raw digits while under 3 characters', () => {
    expect(formatTime('2')).toBe('2');
    expect(formatTime('22')).toBe('22');
  });

  it('inserts a colon after the hour once a 3rd digit is typed', () => {
    expect(formatTime('220')).toBe('22:0');
    expect(formatTime('2200')).toBe('22:00');
  });

  it('strips non-digit characters before formatting', () => {
    expect(formatTime('22:00')).toBe('22:00');
  });

  it('truncates beyond 4 digits', () => {
    expect(formatTime('220099')).toBe('22:00');
  });

  it('returns empty string for empty input', () => {
    expect(formatTime('')).toBe('');
  });
});

describe('addMinutesToTime', () => {
  it('adds minutes within the same hour', () => {
    expect(addMinutesToTime('09:00', 45)).toBe('09:45');
  });

  it('rolls over to the next hour', () => {
    expect(addMinutesToTime('09:30', 45)).toBe('10:15');
  });

  it('wraps past midnight', () => {
    expect(addMinutesToTime('23:30', 45)).toBe('00:15');
  });

  it('handles negative minutes wrapping before midnight', () => {
    expect(addMinutesToTime('00:15', -30)).toBe('23:45');
  });
});
