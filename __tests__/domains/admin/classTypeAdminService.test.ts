jest.mock('../../../src/core/http/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

import { classTypeAdminService } from '../../../src/domains/admin/services/classTypeAdminService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

const CLASS_TYPE = { id: 'ct1', name: 'Yoga', active: true };

const FORM_DATA = { name: 'Yoga', active: true, usesBikes: false };

describe('classTypeAdminService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('list', () => {
    it('reads class types from the wrapped { data: [...] } shape', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: [CLASS_TYPE] } });
      const result = await classTypeAdminService.list();
      expect(mockedApi.get).toHaveBeenCalledWith('/api/class-types');
      expect(result).toEqual([CLASS_TYPE]);
    });

    it('returns an empty array when data is missing', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });
      const result = await classTypeAdminService.list();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('reads the class type directly from the response body (no data wrapper)', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: CLASS_TYPE });
      const result = await classTypeAdminService.getById('ct1');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/class-types/ct1');
      expect(result).toEqual(CLASS_TYPE);
    });

    it('returns undefined when the request fails', async () => {
      (mockedApi.get as jest.Mock).mockRejectedValue(new Error('not found'));
      const result = await classTypeAdminService.getById('missing');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('sends the form data and reads the raw response', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: CLASS_TYPE });
      const result = await classTypeAdminService.create(FORM_DATA);
      expect(mockedApi.post).toHaveBeenCalledWith('/api/class-types', FORM_DATA);
      expect(result).toEqual(CLASS_TYPE);
    });
  });

  describe('update', () => {
    it('reads the raw response', async () => {
      (mockedApi.put as jest.Mock).mockResolvedValue({ data: { ...CLASS_TYPE, name: 'Yoga Editado' } });
      const result = await classTypeAdminService.update('ct1', FORM_DATA);
      expect(mockedApi.put).toHaveBeenCalledWith('/api/class-types/ct1', FORM_DATA);
      expect(result.name).toBe('Yoga Editado');
    });
  });
});
