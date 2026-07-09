jest.mock('../../../src/core/http/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
}));

import { packageAdminService } from '../../../src/domains/admin/services/packageAdminService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

const PACKAGE = {
  id: 'p1', name: '10 Aulas', description: 'Pacote 10 Aulas', credits: 10, price: 340,
  pricePerCredit: 34, validityDays: 90, popular: true, active: true, displayOrder: 0,
};

const FORM_DATA = {
  name: '10 Aulas', description: 'Pacote 10 Aulas', credits: 10, price: 340,
  validityDays: 90, popular: true, active: true, displayOrder: 0,
};

describe('packageAdminService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('list', () => {
    it('reads packages from the wrapped { data: [...] } shape', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: [PACKAGE] } });
      const result = await packageAdminService.list();
      expect(mockedApi.get).toHaveBeenCalledWith('/api/packages');
      expect(result).toEqual([PACKAGE]);
    });

    it('returns an empty array when data is missing', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });
      const result = await packageAdminService.list();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('reads the package directly from the response body (no data wrapper)', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: PACKAGE });
      const result = await packageAdminService.getById('p1');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/packages/p1');
      expect(result).toEqual(PACKAGE);
    });

    it('returns undefined when the request fails', async () => {
      (mockedApi.get as jest.Mock).mockRejectedValue(new Error('not found'));
      const result = await packageAdminService.getById('missing');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('sends the form data and reads the raw response', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: PACKAGE });
      const result = await packageAdminService.create(FORM_DATA);
      expect(mockedApi.post).toHaveBeenCalledWith('/api/packages', FORM_DATA);
      expect(result).toEqual(PACKAGE);
    });
  });

  describe('update', () => {
    it('always sends the active field explicitly and reads the raw response', async () => {
      (mockedApi.put as jest.Mock).mockResolvedValue({ data: { ...PACKAGE, name: '10 Aulas Editado' } });
      const result = await packageAdminService.update('p1', FORM_DATA);
      expect(mockedApi.put).toHaveBeenCalledWith('/api/packages/p1', FORM_DATA);
      expect(FORM_DATA.active).toBeDefined();
      expect(result.name).toBe('10 Aulas Editado');
    });
  });

  describe('toggle', () => {
    it('calls the toggle endpoint and reads the raw updated object', async () => {
      (mockedApi.patch as jest.Mock).mockResolvedValue({ data: { ...PACKAGE, active: false } });
      const result = await packageAdminService.toggle('p1');
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/packages/p1/toggle');
      expect(result.active).toBe(false);
    });
  });
});
