jest.mock('../../../src/core/http/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
}));

import { studioAdminService } from '../../../src/domains/admin/services/studioAdminService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

const STUDIO = {
  id: 'st1', name: 'Palmas', address: 'Rua das Flores, 123', phone: '(63) 99999-0000',
  email: 'palmas@studio.com', active: true, capacity: 20, openingTime: '06:00', closingTime: '22:00',
};

const FORM_DATA = {
  name: 'Palmas', address: 'Rua das Flores, 123', phone: '(63) 99999-0000',
  email: 'palmas@studio.com', capacity: 20, openingTime: '06:00', closingTime: '22:00',
};

describe('studioAdminService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('list', () => {
    it('reads studios from the wrapped { data: [...] } shape', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: [STUDIO] } });
      const result = await studioAdminService.list();
      expect(mockedApi.get).toHaveBeenCalledWith('/api/studios');
      expect(result).toEqual([STUDIO]);
    });
  });

  describe('getById', () => {
    it('reads the studio directly from the response body (no data wrapper)', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: STUDIO });
      const result = await studioAdminService.getById('st1');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/studios/st1');
      expect(result).toEqual(STUDIO);
    });
  });

  describe('create', () => {
    it('always sends active:true and reads the raw response', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: STUDIO });
      const result = await studioAdminService.create(FORM_DATA);
      expect(mockedApi.post).toHaveBeenCalledWith('/api/studios', { ...FORM_DATA, active: true });
      expect(result).toEqual(STUDIO);
    });
  });

  describe('update', () => {
    it('reads the raw response', async () => {
      (mockedApi.put as jest.Mock).mockResolvedValue({ data: { ...STUDIO, name: 'Palmas Editado' } });
      const result = await studioAdminService.update('st1', FORM_DATA);
      expect(mockedApi.put).toHaveBeenCalledWith('/api/studios/st1', FORM_DATA);
      expect(result.name).toBe('Palmas Editado');
    });
  });

  describe('activate / deactivate', () => {
    it('calls the expected PATCH endpoints without expecting a body back', async () => {
      (mockedApi.patch as jest.Mock).mockResolvedValue({ data: { success: true } });
      await expect(studioAdminService.activate('st1')).resolves.toBeUndefined();
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/studios/st1/activate');
      await expect(studioAdminService.deactivate('st1')).resolves.toBeUndefined();
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/studios/st1/deactivate');
    });
  });
});
