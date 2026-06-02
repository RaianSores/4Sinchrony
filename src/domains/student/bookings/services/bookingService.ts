import { api } from '../../../../core/http/api';
import { Booking, Class } from '../../../../shared/types';

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
    const res = await api.get<{ data: any[] }>('/bookings');
    return (res.data.data ?? []).map(adaptBooking);
  },

  checkConflicts(_targetClass: Class, _existingBookings: Booking[]): BookingConflict | null {
    // Conflict validation is enforced server-side on POST /bookings
    return null;
  },

  async createBooking(classId: string, bikeNumber?: number): Promise<Booking> {
    const res = await api.post<{ data: any }>('/bookings', { classId, bikeNumber });
    return adaptBooking(res.data.data);
  },

  async cancelBooking(bookingId: string): Promise<void> {
    await api.post(`/bookings/${bookingId}/cancel`);
  },

  async getBikesForClass(classId: string): Promise<{ number: number; status: string }[]> {
    const res = await api.get<{ data: { number: number; status: string }[] }>(`/classes/${classId}/bikes`);
    return res.data.data ?? [];
  },
};
