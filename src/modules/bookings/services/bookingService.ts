import { Booking, Bike, Class } from '../../../shared/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockBookings: Booking[] = [
  {
    id: 'booking_1',
    class: {
      id: 'class_3',
      name: 'Velo Strength',
      type: 'bike',
      instructor: 'Valderi',
      startTime: '09:00',
      duration: 45,
      studio: { id: 'studio_1', name: 'Palmas', city: 'Palmas', address: 'Rua A, 100' },
      availableSpots: 18,
      totalSpots: 20,
      date: '2026-05-21',
    },
    bikeNumber: 7,
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
  },
];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function isOverlapping(a: { date: string; startTime: string; duration: number }, b: { date: string; startTime: string; duration: number }): boolean {
  if (a.date !== b.date) return false;
  const startA = timeToMinutes(a.startTime);
  const endA = startA + a.duration;
  const startB = timeToMinutes(b.startTime);
  const endB = startB + b.duration;
  return startA < endB && startB < endA;
}

export interface BookingConflict {
  type: 'duplicate' | 'time_conflict';
  existingBooking: Booking;
  message: string;
}

export const bookingService = {
  async getMyBookings(): Promise<Booking[]> {
    await delay(400);
    return [...mockBookings];
  },

  checkConflicts(targetClass: Class, existingBookings: Booking[]): BookingConflict | null {
    const confirmed = existingBookings.filter(b => b.status === 'confirmed');

    for (const booking of confirmed) {
      if (booking.class.id === targetClass.id) {
        return {
          type: 'duplicate',
          existingBooking: booking,
          message: `Você já está inscrito na aula ${targetClass.name} (${targetClass.startTime}).`,
        };
      }

      if (isOverlapping(targetClass, booking.class)) {
        return {
          type: 'time_conflict',
          existingBooking: booking,
          message: `Você já possui aula no mesmo horário: ${booking.class.name} às ${booking.class.startTime}.`,
        };
      }
    }

    return null;
  },

  async createBooking(classId: string, bikeNumber?: number): Promise<Booking> {
    await delay(600);
    const mockClass = {
      id: classId,
      name: 'Velo Power',
      type: 'bike' as const,
      instructor: 'Ádria',
      startTime: '17:30',
      duration: 45,
      studio: { id: 'studio_1', name: 'Palmas', city: 'Palmas', address: 'Rua A, 100' },
      availableSpots: 12,
      totalSpots: 20,
      date: '2026-05-22',
    };

    const newBooking: Booking = {
      id: 'booking_' + Date.now(),
      class: mockClass,
      bikeNumber,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };

    mockBookings = [newBooking, ...mockBookings];
    return newBooking;
  },

  async cancelBooking(bookingId: string): Promise<void> {
    await delay(400);
    mockBookings = mockBookings.map(b =>
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    );
  },

  async getBikesForClass(_classId: string): Promise<Bike[]> {
    await delay(300);
    return Array.from({ length: 20 }, (_, i) => ({
      number: i + 1,
      status: (i < 7 ? 'occupied' : 'available') as 'available' | 'occupied',
    }));
  },
};
