import type { Booking } from '../../core/types';

export function canCancelBooking(booking: Booking): { allowed: boolean; reason?: string } {
  const { date, startTime } = booking.class;
  if (!date || !startTime) return { allowed: true };

  const classDate = new Date(`${date}T${startTime}`);
  if (isNaN(classDate.getTime())) return { allowed: true };

  const now = new Date();
  const diffMs = classDate.getTime() - now.getTime();

  if (diffMs < 0) {
    return { allowed: false, reason: 'Esta aula já aconteceu.' };
  }

  // O prazo de cancelamento (cancellationDeadlineHours) agora é per-pacote e validado pelo
  // backend, que retorna a mensagem exata (ex.: "mínimo 48h de antecedência"). Não replicamos
  // aqui um valor fixo (antes era "2 horas" hardcoded, que conflitava com a regra real) —
  // deixamos passar e a tela mostra a mensagem do backend se ele recusar.
  return { allowed: true };
}
