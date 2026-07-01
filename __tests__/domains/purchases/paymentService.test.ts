jest.mock('../../../src/core/http/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
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

import { paymentService } from '../../../src/domains/student/purchases/services/paymentService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

describe('paymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processPixPayment', () => {
    it('calls POST /payments/pix with correct payload', async () => {
      const mockResult = {
        success: true,
        transactionId: 'tx_123',
        message: 'PIX gerado',
        pixCode: '00020126580014br.gov.bcb.pix0136...',
        pixQRCode: 'data:image/png;base64,...',
      };
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: mockResult });

      const result = await paymentService.processPixPayment(99.90, ['pkg_1']);

      expect(mockedApi.post).toHaveBeenCalledWith('/payments/pix', {
        amount: 99.90,
        packageIds: ['pkg_1'],
        couponCode: undefined,
      });
      expect(result).toEqual(mockResult);
    });

    it('handles failed PIX payment', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({
        data: { success: false, transactionId: 'tx_123', message: 'Erro no processamento' },
      });

      const result = await paymentService.processPixPayment(99.90, ['pkg_1']);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Erro no processamento');
    });
  });

  describe('processCardPayment', () => {
    it('calls POST /payments/card with correct payload', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({
        data: { success: true, transactionId: 'tx_456', message: 'Cartão aprovado' },
      });

      const result = await paymentService.processCardPayment(99.90, 'tok_visa_1234_abc', ['pkg_1']);

      expect(mockedApi.post).toHaveBeenCalledWith('/payments/card', {
        amount: 99.90,
        cardToken: 'tok_visa_1234_abc',
        packageIds: ['pkg_1'],
        couponCode: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getPurchases', () => {
    it('calls GET /purchases and returns data array', async () => {
      const mockPurchases = [
        { id: 'p1', package: { name: '10 aulas' }, amount: 99.90, status: 'confirmed', paymentMethod: 'pix' },
      ];
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: mockPurchases } });

      const result = await paymentService.getPurchases();

      expect(mockedApi.get).toHaveBeenCalledWith('/purchases');
      expect(result).toEqual(mockPurchases);
    });

    it('returns empty array when no purchases', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: null } });

      const result = await paymentService.getPurchases();

      expect(result).toEqual([]);
    });
  });
});
