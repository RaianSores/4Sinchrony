jest.mock('../../../src/core/http/api', () => ({
  api: {
    post: jest.fn(),
  },
}));

jest.mock('../../../src/core/storage', () => ({
  tokenStorage: {
    getToken: jest.fn(),
    setToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setRefreshToken: jest.fn(),
    clear: jest.fn(),
  },
}));

import { verifyEmailService } from '../../../src/core/auth/services/verifyEmailService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

describe('verifyEmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyEmail', () => {
    it('calls POST /auth/verify-email with email', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({
        data: { message: 'Email verificado', success: true },
      });

      const result = await verifyEmailService.verifyEmail({ email: 'test@test.com' });

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/verify-email', { email: 'test@test.com' });
      expect(result.success).toBe(true);
    });
  });

  describe('resendVerification', () => {
    it('calls POST /auth/resend-verification with email', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({
        data: { message: 'Email reenviado' },
      });

      const result = await verifyEmailService.resendVerification({ email: 'test@test.com' });

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/resend-verification', { email: 'test@test.com' });
      expect(result.message).toBe('Email reenviado');
    });
  });
});
