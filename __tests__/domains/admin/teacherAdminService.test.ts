jest.mock('../../../src/core/http/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
}));

import { teacherAdminService } from '../../../src/domains/admin/services/teacherAdminService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

const TEACHER = {
  id: 't1', name: 'Ana Silva', email: 'ana@studio.com', cpf: null,
  phone: '(11) 99999-0000', active: true, avatar: null, specialties: ['Yoga'],
};

describe('teacherAdminService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('list', () => {
    it('reads teachers from the wrapped { data: [...] } shape', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: [TEACHER] } });
      const result = await teacherAdminService.list();
      expect(mockedApi.get).toHaveBeenCalledWith('/api/teachers');
      expect(result).toEqual([TEACHER]);
    });

    it('returns an empty array when data is missing', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });
      expect(await teacherAdminService.list()).toEqual([]);
    });
  });

  describe('getById', () => {
    it('reads the teacher directly from the response body (no data wrapper)', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: TEACHER });
      const result = await teacherAdminService.getById('t1');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/teachers/t1');
      expect(result).toEqual(TEACHER);
    });

    it('returns undefined instead of throwing when the request fails', async () => {
      (mockedApi.get as jest.Mock).mockRejectedValue(new Error('network error'));
      expect(await teacherAdminService.getById('missing')).toBeUndefined();
    });
  });

  describe('create', () => {
    it('sends the payload with an empty-string cpf fallback and reads the raw response', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: TEACHER });
      const result = await teacherAdminService.create({
        name: 'Ana Silva', email: 'ana@studio.com', phone: '(11) 99999-0000',
        specialties: ['Yoga'], password: 'senha123',
      });
      expect(mockedApi.post).toHaveBeenCalledWith('/api/teachers', {
        name: 'Ana Silva', email: 'ana@studio.com', phone: '(11) 99999-0000',
        specialties: ['Yoga'], password: 'senha123', cpf: '',
      });
      expect(result).toEqual(TEACHER);
    });
  });

  describe('update', () => {
    it('reads the updated teacher directly from the response body (no data wrapper)', async () => {
      (mockedApi.put as jest.Mock).mockResolvedValue({ data: { ...TEACHER, name: 'Ana Editada' } });
      const result = await teacherAdminService.update('t1', {
        name: 'Ana Editada', email: 'ana@studio.com', phone: '(11) 99999-0000', specialties: ['Yoga'],
      });
      expect(mockedApi.put).toHaveBeenCalledWith('/api/teachers/t1', {
        name: 'Ana Editada', email: 'ana@studio.com', phone: '(11) 99999-0000', specialties: ['Yoga'], cpf: '',
      });
      expect(result.name).toBe('Ana Editada');
    });
  });

  describe('activate / deactivate', () => {
    it('calls the expected PATCH endpoints', async () => {
      (mockedApi.patch as jest.Mock).mockResolvedValue({ data: { success: true } });
      await teacherAdminService.activate('t1');
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/teachers/t1/activate');
      await teacherAdminService.deactivate('t1');
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/teachers/t1/deactivate');
    });
  });

  describe('sendTemporaryPassword', () => {
    it('returns the generated password from the response', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({
        data: { success: true, message: 'Senha temporária gerada.', temporaryPassword: 'abc123' },
      });
      const result = await teacherAdminService.sendTemporaryPassword('t1');
      expect(mockedApi.post).toHaveBeenCalledWith('/api/teachers/t1/send-password');
      expect(result).toBe('abc123');
    });
  });
});
