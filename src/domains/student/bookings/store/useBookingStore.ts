import { create } from 'zustand';
import { Booking } from '../../../../shared/types';
import { bookingService } from '../services/bookingService';
import { captureError } from '../../../../lib/sentry';

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  fetchBookings: () => Promise<void>;
  bookClass: (classId: string, bikeNumber?: number, studentId?: string) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  isLoading: false,

  fetchBookings: async () => {
    set({ isLoading: true });
    try {
      const bookings = await bookingService.getMyBookings();
      set({ bookings, isLoading: false });
    } catch (error) {
      captureError(error);
      set({ isLoading: false });
    }
  },

  bookClass: async (classId, bikeNumber, studentId) => {
    const booking = await bookingService.createBooking(classId, bikeNumber, studentId);
    // Só adiciona ao store de reservas do titular quando a reserva é dele mesmo — reservas
    // feitas em nome de um dependente pertencem à agenda do dependente, não à "Minhas Reservas".
    if (!studentId) set(state => ({ bookings: [booking, ...state.bookings] }));
    return booking;
  },

  cancelBooking: async (bookingId) => {
    await bookingService.cancelBooking(bookingId);
    set(state => ({
      bookings: state.bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      ),
    }));
  },
}));
