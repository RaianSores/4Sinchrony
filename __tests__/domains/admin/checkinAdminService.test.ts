jest.mock('../../../src/core/http/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import { checkinAdminService } from '../../../src/domains/admin/services/checkinAdminService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

const CHECKIN = {
  id: 'chk1', bookingId: 'b1', classId: 'c1', studentId: 's1', studentName: 'Raian Soares',
  className: 'Yoga Manha', date: '2026-07-09', time: '09:00',
  status: 'confirmed' as const, confirmedBy: null, confirmedAt: null,
};

describe('checkinAdminService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('listAll', () => {
    it('reads checkin records from the wrapped { data: [...] } shape', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: [CHECKIN] } });
      const result = await checkinAdminService.listAll();
      expect(mockedApi.get).toHaveBeenCalledWith('/api/checkin');
      expect(result).toEqual([CHECKIN]);
    });

    it('returns an empty array when data is missing', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });
      const result = await checkinAdminService.listAll();
      expect(result).toEqual([]);
    });
  });

  describe('confirm', () => {
    it('sends an empty body and reads the raw response (no data wrapper)', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: { ...CHECKIN, status: 'attended' } });
      const result = await checkinAdminService.confirm('chk1');
      expect(mockedApi.post).toHaveBeenCalledWith('/api/checkin/chk1/confirm', {});
      expect(result.status).toBe('attended');
    });
  });
});
