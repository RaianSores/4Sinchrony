import { api } from '../../../../core/http/api';
import { ClassPackage } from '../../../../shared/types';
import { captureError } from '../../../../lib/sentry';

export const packageService = {
  async getPackages(): Promise<ClassPackage[]> {
    const res = await api.get<{ data: ClassPackage[] }>('/packages');
    return res.data.data ?? [];
  },

  async getById(id: string): Promise<ClassPackage | undefined> {
    try {
      const res = await api.get<{ data: ClassPackage }>(`/packages/${id}`);
      return res.data.data;
    } catch (error) {
      captureError(error);
      const packages = await packageService.getPackages();
      return packages.find(p => p.id === id);
    }
  },
};
