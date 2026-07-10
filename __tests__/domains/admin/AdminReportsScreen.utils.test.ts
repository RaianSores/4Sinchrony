import { buildOccupancy, buildFrequency, buildCheckinRate } from '../../../src/domains/admin/screens/reports/AdminReportsScreen';
import { AdminClass } from '../../../src/domains/admin/services/classAdminService';
import { AdminBooking } from '../../../src/domains/admin/services/bookingAdminService';
import { AdminCheckinRecord } from '../../../src/domains/admin/services/checkinAdminService';

const makeClass = (overrides: Partial<AdminClass> = {}): AdminClass => ({
  id: 'c1', name: 'Bike', type: 'Bike Auditoria', classTypeId: 'ct1',
  instructor: 'Professor', teacherId: 't1', studioId: 'st1', studioName: 'Palmas',
  date: '2026-07-10', startTime: '10:00', endTime: '10:45', duration: 45,
  totalSpots: 20, availableSpots: 19, status: 'completed', enrolledCount: 1,
  ...overrides,
});

const makeBooking = (overrides: Partial<AdminBooking> = {}): AdminBooking => ({
  id: 'b1', classId: 'c1', className: 'Bike', studentId: 's1',
  studentName: 'Raian Soares', studentEmail: 'raian@example.com', status: 'confirmed',
  bikeNumber: 1, bookedAt: '2026-07-10T12:28:03.539115Z', checkedIn: false,
  ...overrides,
});

const makeCheckin = (overrides: Partial<AdminCheckinRecord> = {}): AdminCheckinRecord => ({
  id: 'chk1', bookingId: 'b1', classId: 'c1', studentId: 's1', studentName: 'Raian Soares',
  className: 'Bike', date: '2026-07-10', time: '12:28', status: 'attended',
  confirmedBy: 'Professor', confirmedAt: '2026-07-10T12:28:54.648475Z',
  ...overrides,
});

describe('buildOccupancy', () => {
  it('counts active bookings and reflects real attended check-ins', () => {
    const classes = [makeClass()];
    const bookings = [makeBooking()];
    const checkins = [makeCheckin()];

    const result = buildOccupancy(classes, bookings, checkins, 30);

    expect(result).toEqual([
      { date: '2026-07-10', className: 'Bike', totalSpots: 20, booked: 1, attended: 1, occupancyPercent: 5 },
    ]);
  });

  it('excludes cancelled bookings from booked/attended counts', () => {
    const classes = [makeClass()];
    const bookings = [makeBooking({ status: 'cancelled' })];
    const checkins = [makeCheckin()];

    const result = buildOccupancy(classes, bookings, checkins, 30);

    expect(result[0].booked).toBe(0);
    expect(result[0].attended).toBe(0);
  });

  it('does not count a stale/orphaned checkin whose booking is no longer active', () => {
    const classes = [makeClass()];
    const bookings: AdminBooking[] = [];
    const checkins = [makeCheckin()];

    const result = buildOccupancy(classes, bookings, checkins, 30);

    expect(result[0].booked).toBe(0);
    expect(result[0].attended).toBe(0);
  });

  it('excludes cancelled classes', () => {
    const classes = [makeClass({ status: 'cancelled' })];
    const result = buildOccupancy(classes, [makeBooking()], [], 30);
    expect(result).toEqual([]);
  });

  it('excludes classes older than the requested window', () => {
    const classes = [makeClass({ date: '2020-01-01' })];
    const result = buildOccupancy(classes, [], [], 30);
    expect(result).toEqual([]);
  });

  it('returns 0% occupancy when totalSpots is 0', () => {
    const classes = [makeClass({ totalSpots: 0 })];
    const result = buildOccupancy(classes, [makeBooking()], [], 30);
    expect(result[0].occupancyPercent).toBe(0);
  });
});

describe('buildFrequency', () => {
  it('always returns all 7 weekdays in order, even with no data', () => {
    const result = buildFrequency([], []);
    expect(result.map(r => r.day)).toEqual(['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']);
    expect(result.every(r => r.count === 0)).toBe(true);
  });

  it('counts a booking on the weekday of its class date, not the booking date', () => {
    const classes = [makeClass({ id: 'c1', date: '2026-07-10' })]; // Friday
    const bookings = [makeBooking({ classId: 'c1', bookedAt: '2026-01-01T00:00:00Z' })];

    const result = buildFrequency(classes, bookings);

    expect(result.find(r => r.day === 'Sex')?.count).toBe(1);
    expect(result.filter(r => r.day !== 'Sex').every(r => r.count === 0)).toBe(true);
  });

  it('excludes cancelled bookings', () => {
    const classes = [makeClass({ id: 'c1', date: '2026-07-10' })];
    const bookings = [makeBooking({ classId: 'c1', status: 'cancelled' })];

    const result = buildFrequency(classes, bookings);

    expect(result.every(r => r.count === 0)).toBe(true);
  });

  it('ignores bookings whose class no longer exists', () => {
    const bookings = [makeBooking({ classId: 'missing' })];
    const result = buildFrequency([], bookings);
    expect(result.every(r => r.count === 0)).toBe(true);
  });

  it('groups a Sunday class correctly', () => {
    const classes = [makeClass({ id: 'c1', date: '2026-07-12' })]; // Sunday
    const bookings = [makeBooking({ classId: 'c1' })];

    const result = buildFrequency(classes, bookings);

    expect(result.find(r => r.day === 'Dom')?.count).toBe(1);
  });
});

describe('buildCheckinRate', () => {
  it('returns 0 when there are no active bookings', () => {
    expect(buildCheckinRate([], [])).toBe(0);
  });

  it('reflects a real attended check-in (matches the live bug report)', () => {
    const bookings = [makeBooking()];
    const checkins = [makeCheckin()];
    expect(buildCheckinRate(bookings, checkins)).toBe(100);
  });

  it('excludes cancelled bookings from the denominator', () => {
    const bookings = [makeBooking({ id: 'b1', status: 'cancelled' }), makeBooking({ id: 'b2' })];
    const checkins = [makeCheckin({ bookingId: 'b2' })];
    expect(buildCheckinRate(bookings, checkins)).toBe(100);
  });

  it('does not count a stale/orphaned checkin whose booking is no longer active', () => {
    const bookings = [makeBooking({ id: 'b2', status: 'confirmed' })];
    const checkins = [makeCheckin({ bookingId: 'b1' })]; // orphaned, different booking
    expect(buildCheckinRate(bookings, checkins)).toBe(0);
  });

  it('computes a partial rate across multiple bookings', () => {
    const bookings = [makeBooking({ id: 'b1' }), makeBooking({ id: 'b2' })];
    const checkins = [makeCheckin({ bookingId: 'b1' })];
    expect(buildCheckinRate(bookings, checkins)).toBe(50);
  });
});
