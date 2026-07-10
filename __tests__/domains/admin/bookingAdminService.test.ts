jest.mock('../../../src/core/http/api', () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

import { bookingAdminService, resolveEffectiveBookingStatus } from '../../../src/domains/admin/services/bookingAdminService';
import { api } from '../../../src/core/http/api';
import type { AdminCheckinRecord } from '../../../src/domains/admin/services/checkinAdminService';

const mockedApi = api as jest.Mocked<typeof api>;

const BOOKING = {
  id: 'b1', classId: 'c1', className: 'Yoga Manha', studentId: 's1',
  studentName: 'Raian Soares', studentEmail: 'raian@example.com', status: 'confirmed' as const,
  bikeNumber: null, bookedAt: '2026-07-09T14:31:22.198766Z', checkedIn: false,
};

describe('bookingAdminService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('list', () => {
    it('reads bookings from the wrapped { data: [...] } shape', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: [BOOKING], pagination: { page: 1 } } });
      const result = await bookingAdminService.list();
      expect(mockedApi.get).toHaveBeenCalledWith('/api/bookings');
      expect(result).toEqual([BOOKING]);
    });

    it('returns an empty array when data is missing', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });
      const result = await bookingAdminService.list();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('reads the booking directly from the response body (no data wrapper)', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: BOOKING });
      const result = await bookingAdminService.getById('b1');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/bookings/b1');
      expect(result).toEqual(BOOKING);
    });

    it('returns undefined when the request fails', async () => {
      (mockedApi.get as jest.Mock).mockRejectedValue(new Error('not found'));
      const result = await bookingAdminService.getById('missing');
      expect(result).toBeUndefined();
    });
  });

  describe('cancel', () => {
    it('calls the cancel endpoint and reads the raw response', async () => {
      (mockedApi.patch as jest.Mock).mockResolvedValue({ data: { ...BOOKING, status: 'cancelled' } });
      const result = await bookingAdminService.cancel('b1');
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/bookings/b1/cancel');
      expect(result.status).toBe('cancelled');
    });
  });

  describe('markNoShow', () => {
    it('calls the no-show endpoint and reads the raw response', async () => {
      (mockedApi.patch as jest.Mock).mockResolvedValue({ data: { ...BOOKING, status: 'no_show' } });
      const result = await bookingAdminService.markNoShow('b1');
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/bookings/b1/no-show');
      expect(result.status).toBe('no_show');
    });
  });
});

describe('resolveEffectiveBookingStatus', () => {
  const makeCheckin = (overrides: Partial<AdminCheckinRecord> = {}): AdminCheckinRecord => ({
    id: 'chk1', bookingId: 'b1', classId: 'c1', studentId: 's1', studentName: 'Raian Soares',
    className: 'Yoga Manha', date: '2026-07-10', time: '09:00', status: 'confirmed',
    confirmedBy: null, confirmedAt: null,
    ...overrides,
  });

  it('reflects a real attended check-in even though the booking itself is still "confirmed" (matches the live bug report)', () => {
    const checkin = makeCheckin({ status: 'attended' });
    expect(resolveEffectiveBookingStatus(BOOKING, checkin)).toBe('attended');
  });

  it('reflects a real no-show check-in', () => {
    const checkin = makeCheckin({ status: 'no_show' });
    expect(resolveEffectiveBookingStatus(BOOKING, checkin)).toBe('no_show');
  });

  it('falls back to the booking status when there is no matching check-in record', () => {
    expect(resolveEffectiveBookingStatus(BOOKING, undefined)).toBe('confirmed');
  });

  it('always treats a cancelled booking as cancelled, even with a stale attended check-in', () => {
    const cancelledBooking = { ...BOOKING, status: 'cancelled' as const };
    const staleCheckin = makeCheckin({ status: 'attended' });
    expect(resolveEffectiveBookingStatus(cancelledBooking, staleCheckin)).toBe('cancelled');
  });
});
