jest.mock('../../../src/core/http/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
}));

import { studentAdminService } from '../../../src/domains/admin/services/studentAdminService';
import { api } from '../../../src/core/http/api';

const mockedApi = api as jest.Mocked<typeof api>;

const STUDENT = {
  id: 's1', name: 'Carlos Silva', email: 'carlos@email.com', cpf: '02324185199',
  phone: '(11) 99999-0000', status: 'active' as const, plan: 'Básico', credits: 5,
  avatar: null, registeredAt: '2026-01-15', lastVisit: null, totalClasses: 3,
};

const FORM_DATA = {
  name: 'Carlos Silva', email: 'carlos@email.com', phone: '(11) 99999-0000',
  cpf: '02324185199', plan: 'Básico', status: 'active' as const,
};

describe('studentAdminService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('list', () => {
    it('reads students and pagination from the wrapped shape, forwarding page/pageSize', async () => {
      const pagination = { page: 1, pageSize: 20, total: 1, totalPages: 1 };
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: [STUDENT], pagination } });

      const result = await studentAdminService.list(1, 20);

      expect(mockedApi.get).toHaveBeenCalledWith('/api/students', { params: { page: 1, pageSize: 20 } });
      expect(result).toEqual({ data: [STUDENT], pagination });
    });

    it('falls back to a zeroed pagination when the API omits it', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: [] } });
      const result = await studentAdminService.list(2, 10);
      expect(result.pagination).toEqual({ page: 2, pageSize: 10, total: 0, totalPages: 0 });
    });
  });

  describe('getById', () => {
    it('reads the student directly from the response body (no data wrapper)', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: STUDENT });
      const result = await studentAdminService.getById('s1');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/students/s1');
      expect(result).toEqual(STUDENT);
    });

    it('returns undefined instead of throwing when the request fails', async () => {
      (mockedApi.get as jest.Mock).mockRejectedValue(new Error('network error'));
      expect(await studentAdminService.getById('missing')).toBeUndefined();
    });
  });

  describe('create / update', () => {
    it('create reads the raw response body', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: STUDENT });
      const result = await studentAdminService.create(FORM_DATA);
      expect(mockedApi.post).toHaveBeenCalledWith('/api/students', FORM_DATA);
      expect(result).toEqual(STUDENT);
    });

    it('update reads the raw response body', async () => {
      (mockedApi.put as jest.Mock).mockResolvedValue({ data: { ...STUDENT, name: 'Carlos Editado' } });
      const result = await studentAdminService.update('s1', FORM_DATA);
      expect(mockedApi.put).toHaveBeenCalledWith('/api/students/s1', FORM_DATA);
      expect(result.name).toBe('Carlos Editado');
    });
  });

  describe('deactivate / reactivate', () => {
    it('calls the expected PATCH endpoints and reads the updated student back', async () => {
      (mockedApi.patch as jest.Mock).mockResolvedValue({ data: { ...STUDENT, status: 'inactive' } });
      const deactivated = await studentAdminService.deactivate('s1');
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/students/s1/deactivate');
      expect(deactivated.status).toBe('inactive');

      (mockedApi.patch as jest.Mock).mockResolvedValue({ data: { ...STUDENT, status: 'active' } });
      const reactivated = await studentAdminService.reactivate('s1');
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/students/s1/reactivate');
      expect(reactivated.status).toBe('active');
    });
  });

  describe('getHistory', () => {
    it('reads history items from the wrapped shape', async () => {
      const history = [{ date: '2026-06-06', className: 'Yoga Matinal', status: 'attended' }];
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { data: history } });
      const result = await studentAdminService.getHistory('s1');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/students/s1/history');
      expect(result).toEqual(history);
    });

    it('returns an empty array when data is missing', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });
      expect(await studentAdminService.getHistory('s1')).toEqual([]);
    });
  });
});
