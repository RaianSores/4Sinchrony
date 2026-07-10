import { api } from '../../../core/http/api';

export interface AdminSettings {
  studioName: string;
  studioEmail: string;
  studioPhone: string;
  studioAddress: string;
  bookingWindowDays: number;
  cancellationDeadlineHours: number;
  maxBookingsPerStudent: number;
  allowWaitlist: boolean;
  autoConfirmBookings: boolean;
  sendBookingConfirmationEmail: boolean;
  sendReminderEmail: boolean;
  reminderHoursBefore: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpFrom: string;
  smtpSecure: boolean;
}

export type SettingsUpdateData = Omit<AdminSettings, 'smtpPassword'> & { smtpPassword?: string };

// Contrato confirmado ao vivo em 09/07/2026: `GET`/`PUT /api/settings` retornam o objeto
// direto (sem wrapper `data`), igual ao que o `settingsService.ts` do ERP já assume
// corretamente — não é um endpoint de escrita "de entidade" como os das fases anteriores,
// então não repete o bug de wrap/unwrap encontrado lá.
// Achados importantes:
// - `PUT` é um partial update de verdade — testado ao vivo mandando só `studioAddress` no
//   corpo, e todos os outros campos (inclusive os de SMTP e regras de reserva) ficaram
//   intactos. Diferente do bug encontrado em Pacotes, onde `active` zerava se omitido.
// - Os campos `smtp*` existem de verdade no backend (não documentados em API_REFERENCE.md,
//   mas confirmados ao vivo) e `smtpPassword` sempre volta mascarado como `"••••••••"` — nunca
//   o valor real. Por isso `update()` só deve receber `smtpPassword` quando o admin realmente
//   digitou uma senha nova; a tela nunca reenvia o placeholder mascarado de volta (ao
//   contrário do ERP, que guarda a senha em texto puro no `sessionStorage` do navegador como
//   workaround — não replicamos isso, é uma prática insegura desnecessária agora que sabemos
//   que o backend já mascara corretamente).
export const settingsAdminService = {
  async get(): Promise<AdminSettings> {
    const res = await api.get<AdminSettings>('/api/settings');
    return res.data;
  },

  async update(data: SettingsUpdateData): Promise<AdminSettings> {
    const res = await api.put<AdminSettings>('/api/settings', data);
    return res.data;
  },
};
