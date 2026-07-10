jest.mock('../../../src/core/http/api', () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

import { settingsAdminService } from '../../../src/domains/admin/services/settingsAdminService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

const SETTINGS = {
  studioName: '4Sinchrony Experience', studioEmail: '', studioPhone: '', studioAddress: '',
  bookingWindowDays: 7, cancellationDeadlineHours: 2, maxBookingsPerStudent: 5,
  allowWaitlist: true, autoConfirmBookings: true,
  sendBookingConfirmationEmail: true, sendReminderEmail: true, reminderHoursBefore: 24,
  smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: 'user@gmail.com',
  smtpPassword: '••••••••', smtpFrom: 'Studio <user@gmail.com>', smtpSecure: true,
};

describe('settingsAdminService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('get', () => {
    it('reads settings directly from the response body (no data wrapper)', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: SETTINGS });
      const result = await settingsAdminService.get();
      expect(mockedApi.get).toHaveBeenCalledWith('/api/settings');
      expect(result).toEqual(SETTINGS);
    });

    it('always returns a masked smtpPassword placeholder, never a real value', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: SETTINGS });
      const result = await settingsAdminService.get();
      expect(result.smtpPassword).toBe('••••••••');
    });
  });

  describe('update', () => {
    it('sends a partial payload without smtpPassword when the password was not changed', async () => {
      const { smtpPassword: _smtpPassword, ...updateData } = SETTINGS;
      (mockedApi.put as jest.Mock).mockResolvedValue({ data: { ...SETTINGS, studioAddress: 'Rua Nova, 100' } });
      const result = await settingsAdminService.update(updateData);
      expect(mockedApi.put).toHaveBeenCalledWith('/api/settings', updateData);
      expect((mockedApi.put as jest.Mock).mock.calls[0][1].smtpPassword).toBeUndefined();
      expect(result.studioAddress).toBe('Rua Nova, 100');
    });

    it('includes smtpPassword only when the caller explicitly sets a new value', async () => {
      const { smtpPassword: _smtpPassword, ...rest } = SETTINGS;
      const updateData = { ...rest, smtpPassword: 'novaSenhaSegura123' };
      (mockedApi.put as jest.Mock).mockResolvedValue({ data: SETTINGS });
      await settingsAdminService.update(updateData);
      expect(mockedApi.put).toHaveBeenCalledWith('/api/settings', updateData);
    });
  });
});
