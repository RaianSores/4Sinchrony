import { canCancelBooking } from '../../../src/shared/utils/canCancelBooking';
import type { Booking } from '../../../src/core/types';

function makeBooking(date: string, startTime: string): Booking {
  return {
    id: '1',
    class: {
      id: 'c1',
      name: 'Spinning',
      type: 'spinning',
      instructor: 'Instrutor',
      startTime,
      duration: 45,
      studio: { id: 's1', name: 'Studio', address: 'Rua X', phone: '63 99999-0000', city: 'Palmas' },
      availableSpots: 5,
      totalSpots: 20,
      date,
    },
    classId: 'c1',
    className: 'Spinning',
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
    checkedIn: false,
  };
}

describe('canCancelBooking', () => {
  it('allows cancellation for future class with >2h notice', () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    future.setHours(12, 0, 0, 0);
    const dateStr = future.toISOString().split('T')[0];
    const result = canCancelBooking(makeBooking(dateStr, '12:00'));
    expect(result.allowed).toBe(true);
  });

  it('blocks cancellation for past class', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    past.setHours(12, 0, 0, 0);
    const dateStr = past.toISOString().split('T')[0];
    const result = canCancelBooking(makeBooking(dateStr, '12:00'));
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('já aconteceu');
  });

  it('blocks cancellation with <2h notice', () => {
    const soon = new Date();
    soon.setHours(soon.getHours() + 1);
    const dateStr = soon.toISOString().split('T')[0];
    const timeStr = `${String(soon.getHours()).padStart(2, '0')}:${String(soon.getMinutes()).padStart(2, '0')}`;
    const result = canCancelBooking(makeBooking(dateStr, timeStr));
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('2 horas');
  });

  it('allows cancellation when date/startTime is missing', () => {
    const booking = makeBooking('', '');
    const result = canCancelBooking(booking);
    expect(result.allowed).toBe(true);
  });

  it('allows cancellation when date is invalid', () => {
    const booking = makeBooking('invalid-date', '12:00');
    const result = canCancelBooking(booking);
    expect(result.allowed).toBe(true);
  });
});
