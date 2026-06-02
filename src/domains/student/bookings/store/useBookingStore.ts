import { create } from 'zustand';
import { Booking } from '../../../../shared/types';
import { bookingService } from '../services/bookingService';

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  fetchBookings: () => Promise<void>;
  bookClass: (classId: string, bikeNumber?: number) => Promise<Booking>;
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
    } catch {
      set({ isLoading: false });
    }
  },

  bookClass: async (classId, bikeNumber) => {
    const booking = await bookingService.createBooking(classId, bikeNumber);
    set(state => ({ bookings: [booking, ...state.bookings] }));
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
