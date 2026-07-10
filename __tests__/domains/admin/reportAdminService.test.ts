jest.mock('../../../src/core/http/api', () => ({
  api: {
    get: jest.fn(),
  },
}));

import { reportAdminService } from '../../../src/domains/admin/services/reportAdminService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

const SUMMARY = {
  totalStudents: 248, activeStudents: 198, totalClasses: 184, totalBookings: 1240,
  occupancyRate: 76, checkinRate: 82, revenue: 45800, period: 'Jul/2026',
};

const OCCUPANCY_ITEM = {
  date: '2026-07-10', className: 'Bike Auditoria Manha', totalSpots: 10,
  booked: 1, attended: 0, occupancyPercent: 10,
};

const FREQUENCY_ITEM = { day: 'Seg', count: 45 };

describe('reportAdminService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getSummary', () => {
    it('reads the summary directly from the response body (no data wrapper)', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: SUMMARY });
      const result = await reportAdminService.getSummary('month');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/reports/summary', { params: { period: 'month' } });
      expect(result).toEqual(SUMMARY);
    });
  });

  describe('getOccupancy', () => {
    it('reads occupancy items from the wrapped { data: [...] } shape', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: [OCCUPANCY_ITEM] } });
      const result = await reportAdminService.getOccupancy(30);
      expect(mockedApi.get).toHaveBeenCalledWith('/api/reports/occupancy', { params: { days: 30 } });
      expect(result).toEqual([OCCUPANCY_ITEM]);
    });

    it('returns an empty array when data is missing', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });
      const result = await reportAdminService.getOccupancy(30);
      expect(result).toEqual([]);
    });
  });

  describe('getFrequencyByDay', () => {
    it('reads frequency items from the wrapped { data: [...] } shape', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: [FREQUENCY_ITEM] } });
      const result = await reportAdminService.getFrequencyByDay();
      expect(mockedApi.get).toHaveBeenCalledWith('/api/reports/frequency');
      expect(result).toEqual([FREQUENCY_ITEM]);
    });

    it('returns an empty array when data is missing', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });
      const result = await reportAdminService.getFrequencyByDay();
      expect(result).toEqual([]);
    });
  });
});
