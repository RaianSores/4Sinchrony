jest.mock('../../../src/core/http/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

import { classAdminService } from '../../../src/domains/admin/services/classAdminService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

const CLASS = {
  id: 'c1', name: 'Yoga Manha', type: 'Yoga', classTypeId: 'ct1',
  instructor: 'Professor Teste', teacherId: 't1', studioId: 'st1', studioName: 'Palmas',
  date: '2026-08-01', startTime: '09:00', endTime: '09:45', duration: 45,
  totalSpots: 10, availableSpots: 10, status: 'scheduled' as const, enrolledCount: 0,
};

const CREATE_DATA = {
  name: 'Yoga Manha', classTypeId: 'ct1', teacherId: 't1', studioId: 'st1',
  date: '2026-08-01', startTime: '09:00', endTime: '09:45', duration: 45, totalSpots: 10,
};

const UPDATE_DATA = { ...CREATE_DATA, status: 'scheduled' as const };

describe('classAdminService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('list', () => {
    it('reads classes from the wrapped { data: [...] } shape', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: [CLASS] } });
      const result = await classAdminService.list();
      expect(mockedApi.get).toHaveBeenCalledWith('/api/classes');
      expect(result).toEqual([CLASS]);
    });

    it('returns an empty array when data is missing', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });
      const result = await classAdminService.list();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('reads the class directly from the response body (no data wrapper)', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: CLASS });
      const result = await classAdminService.getById('c1');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/classes/c1');
      expect(result).toEqual(CLASS);
    });

    it('returns undefined when the request fails', async () => {
      (mockedApi.get as jest.Mock).mockRejectedValue(new Error('not found'));
      const result = await classAdminService.getById('missing');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('sends the form data without a status field and reads the raw response', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: CLASS });
      const result = await classAdminService.create(CREATE_DATA);
      expect(mockedApi.post).toHaveBeenCalledWith('/api/classes', CREATE_DATA);
      expect(result).toEqual(CLASS);
    });
  });

  describe('update', () => {
    it('sends the form data including the required status field', async () => {
      (mockedApi.put as jest.Mock).mockResolvedValue({ data: { ...CLASS, name: 'Yoga Editada' } });
      const result = await classAdminService.update('c1', UPDATE_DATA);
      expect(mockedApi.put).toHaveBeenCalledWith('/api/classes/c1', UPDATE_DATA);
      expect(result.name).toBe('Yoga Editada');
    });
  });
});
