import type { Booking } from '../../core/types';

export function canCancelBooking(booking: Booking): { allowed: boolean; reason?: string } {
  const { date, startTime } = booking.class;
  if (!date || !startTime) return { allowed: true };

  const classDate = new Date(`${date}T${startTime}`);
  if (isNaN(classDate.getTime())) return { allowed: true };

  const now = new Date();
  const diffMs = classDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) {
    return { allowed: false, reason: 'Esta aula já aconteceu.' };
  }

  if (diffHours < 2) {
    return { allowed: false, reason: 'Não é possível cancelar com menos de 2 horas de antecedência.' };
  }

  return { allowed: true };
}
