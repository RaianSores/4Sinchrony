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

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

function adaptBooking(b: any): Booking {
  const cl = b.class ? adaptClass(b.class) : adaptClass({
    id: b.classId, name: b.className, studioId: '', studioName: '',
  });
  return {
    id: b.id,
    class: cl,
    classId: b.classId || cl.id,
    className: b.className || cl.name,
    studentId: b.studentId,
    studentName: b.studentName,
    studentEmail: b.studentEmail,
    bikeNumber: b.bikeNumber,
    status: b.status,
    bookedAt: b.bookedAt,
    checkedIn: b.checkedIn ?? false,
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

  checkConflicts(targetClass: Class, existingBookings: Booking[]): BookingConflict | null {
    const sameDateBookings = existingBookings.filter(
      b => b.status === 'confirmed' && b.class.date === targetClass.date
    );

    const duplicate = sameDateBookings.find(b => b.class.id === targetClass.id);
    if (duplicate) {
      return {
        type: 'duplicate',
        existingBooking: duplicate,
        message: `Você já está inscrito nesta aula.`,
      };
    }

    if (!targetClass.startTime) return null;
    const targetStart = timeToMinutes(targetClass.startTime);
    const targetEnd = targetStart + (targetClass.duration || 60);

    for (const booking of sameDateBookings) {
      const existingStart = timeToMinutes(booking.class.startTime);
      const existingEnd = existingStart + (booking.class.duration || 60);

      if (targetStart < existingEnd && targetEnd > existingStart) {
        return {
          type: 'time_conflict',
          existingBooking: booking,
          message: `Conflito de horário com ${booking.class.name} (${booking.class.startTime}).`,
        };
      }
    }

    return null;
  },

  async createBooking(classId: string, bikeNumber?: number): Promise<Booking> {
    const res = await api.post<any>('/bookings', { classId, bikeNumber });
    const raw = res.data?.data ?? res.data;
    return adaptBooking(raw);
  },

  async cancelBooking(bookingId: string): Promise<void> {
    await api.post(`/bookings/${bookingId}/cancel`);
  },

  async getBikesForClass(classId: string): Promise<{ number: number; status: string }[]> {
    const res = await api.get<{ data: { number: number; status: string }[] }>(`/classes/${classId}/bikes`);
    return res.data.data ?? [];
  },
};
