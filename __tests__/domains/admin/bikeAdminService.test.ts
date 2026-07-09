jest.mock('../../../src/core/http/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { bikeAdminService } from '../../../src/domains/admin/services/bikeAdminService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

const BIKE = {
  id: 'b1', studioId: 'st1', number: 1, status: 'available' as const,
  lastMaintenance: null, notes: null,
};

describe('bikeAdminService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('listByStudio', () => {
    it('reads bikes from the wrapped { data: [...] } shape', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: [BIKE] } });
      const result = await bikeAdminService.listByStudio('st1');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/studios/st1/bikes');
      expect(result).toEqual([BIKE]);
    });

    it('returns an empty array when data is missing', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });
      expect(await bikeAdminService.listByStudio('st1')).toEqual([]);
    });
  });

  describe('create', () => {
    it('posts to the studio-scoped endpoint and reads the raw response', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: BIKE });
      const result = await bikeAdminService.create('st1', { number: 1, status: 'available' });
      expect(mockedApi.post).toHaveBeenCalledWith('/api/studios/st1/bikes', { number: 1, status: 'available' });
      expect(result).toEqual(BIKE);
    });
  });

  describe('update', () => {
    it('puts to the bike-scoped endpoint (not studio-scoped) and reads the raw response', async () => {
      (mockedApi.put as jest.Mock).mockResolvedValue({ data: { ...BIKE, status: 'maintenance', notes: 'Pneu furado' } });
      const result = await bikeAdminService.update('b1', { status: 'maintenance', notes: 'Pneu furado' });
      expect(mockedApi.put).toHaveBeenCalledWith('/api/bikes/b1', { status: 'maintenance', notes: 'Pneu furado' });
      expect(result.status).toBe('maintenance');
    });
  });

  describe('remove', () => {
    it('calls DELETE on the bike-scoped endpoint', async () => {
      (mockedApi.delete as jest.Mock).mockResolvedValue({ data: { success: true } });
      await bikeAdminService.remove('b1');
      expect(mockedApi.delete).toHaveBeenCalledWith('/api/bikes/b1');
    });
  });
});
