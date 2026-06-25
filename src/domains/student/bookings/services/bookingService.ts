import { PAYMENT_MOCK } from '@env';
import { api } from '../../../../core/http/api';
import { Booking, Class } from '../../../../shared/types';

const isMock = PAYMENT_MOCK === 'true';

function adaptClass(c: any): Class {
  return {
    id: c.id,
    name: c.name,
    type: c.type || '',
    instructor: c.instructor || '',
    instructorAvatar: c.instructorAvatar,
    teacherId: c.teacherId,
    startTime: c.startTime || '',
    duration: c.duration || 0,
    studio: c.studio
      ? { id: c.studio.id, name: c.studio.name, city: '', address: c.studio.address || '' }
      : { id: c.studioId || '', name: c.studioName || '', city: '', address: '' },
    availableSpots: c.availableSpots || 0,
    totalSpots: c.totalSpots || 0,
    date: c.date || '',
    status: c.status,
    enrolledCount: c.enrolledCount,
  };
}

function adaptBooking(b: any): Booking {
  return {
    id: b.id,
    class: b.class ? adaptClass(b.class) : adaptClass({
      id: b.classId, name: b.className, studioId: '', studioName: '',
    }),
    bikeNumber: b.bikeNumber,
    status: b.status,
    bookedAt: b.bookedAt,
  };
}

export interface BookingConflict {
  type: 'duplicate' | 'time_conflict';
  existingBooking: Booking;
  message: string;
}

export const bookingService = {
  async getMyBookings(): Promise<Booking[]> {
    if (isMock) return [];
    const res = await api.get<{ data: any[] }>('/bookings');
    return (res.data.data ?? []).map(adaptBooking);
  },

  checkConflicts(_targetClass: Class, _existingBookings: Booking[]): BookingConflict | null {
    return null;
  },

  async createBooking(classId: string, bikeNumber?: number): Promise<Booking> {
    if (isMock) {
      await new Promise(r => setTimeout(r, 800));
      return {
        id: 'mock_booking_' + Date.now(),
        class: { id: classId, name: '', type: '', instructor: '', startTime: '', duration: 0,
          studio: { id: '', name: '', city: '', address: '' }, availableSpots: 0, totalSpots: 0, date: '' },
        bikeNumber,
        status: 'confirmed',
        bookedAt: new Date().toISOString(),
      };
    }
    const res = await api.post<any>('/bookings', { classId, bikeNumber });
    const raw = res.data?.data ?? res.data;
    return adaptBooking(raw);
  },

  async cancelBooking(bookingId: string): Promise<void> {
    if (isMock) {
      await new Promise(r => setTimeout(r, 500));
      return;
    }
    await api.post(`/bookings/${bookingId}/cancel`);
  },

  async getBikesForClass(classId: string): Promise<{ number: number; status: string }[]> {
    if (isMock) return [];
    const res = await api.get<{ data: { number: number; status: string }[] }>(`/classes/${classId}/bikes`);
    return res.data.data ?? [];
  },
};
