jest.mock('../../../src/core/http/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
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

jest.mock('../../../src/config/env', () => ({
  env: {
    API_URL: 'http://test.api.com',
  },
}));

import { authService } from '../../../src/core/auth/services/authService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@test.com',
  role: 'student' as const,
  credits: 5,
};

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('calls POST /auth/login with credentials', async () => {
      const credentials = { email: 'test@test.com', password: '123456' };
      const mockResponse = { data: { user: mockUser, token: 'abc', refresh_token: 'def' } };
      (mockedApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
    });

    it('throws on invalid credentials', async () => {
      (mockedApi.post as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      await expect(authService.login({ email: 'wrong', password: 'wrong' })).rejects.toThrow('Invalid credentials');
    });

    it('normalizes the real API camelCase response (accessToken/refreshToken) instead of returning refresh_token as undefined', async () => {
      const credentials = { email: 'test@test.com', password: '123456' };
      const mockResponse = {
        data: {
          user: mockUser,
          token: 'abc',
          accessToken: 'abc',
          refreshToken: 'real-refresh-token',
          tokenType: 'Bearer',
          expiresIn: 900,
        },
      };
      (mockedApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(result.token).toBe('abc');
      expect(result.refresh_token).toBe('real-refresh-token');
    });
  });

  describe('register', () => {
    it('calls POST /auth/register with user data', async () => {
      const data = { name: 'New User', email: 'new@test.com', cpf: '52998224725', phone: '61999999999', password: '123456' };
      const mockResponse = { data: { user: mockUser, token: 'abc', refresh_token: 'def' } };
      (mockedApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.register(data);

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', data);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('forgotPassword', () => {
    it('calls POST /auth/forgot-password with email', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: { success: true, message: 'Email sent' } });

      const result = await authService.forgotPassword('test@test.com');

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@test.com' });
      expect(result.success).toBe(true);
    });
  });

  describe('getMe', () => {
    it('calls GET /auth/me', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const result = await authService.getMe();

      expect(mockedApi.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });
  });
});
