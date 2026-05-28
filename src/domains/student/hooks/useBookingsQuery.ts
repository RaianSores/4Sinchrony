import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../bookings/services/bookingService';
import { queryKeys } from '../../../core/query/keys';

export function useBookings() {
  return useQuery({
    queryKey: queryKeys.student.bookings.all,
    queryFn: () => bookingService.getMyBookings(),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { classId: string; bikeNumber?: number }) =>
      bookingService.createBooking(params.classId, params.bikeNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.student.bookings.all });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingService.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.student.bookings.all });
    },
  });
}
