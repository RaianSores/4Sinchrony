import { api } from '../../../../core/http/api';
import { Class } from '../../../../shared/types';

function adaptClass(c: any): Class {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    instructor: c.instructor,
    instructorAvatar: c.instructorAvatar,
    teacherId: c.teacherId,
    startTime: c.startTime,
    duration: c.duration,
    studio: c.studio
      ? { id: c.studio.id, name: c.studio.name, city: '', address: c.studio.address || '' }
      : { id: c.studioId || '', name: c.studioName || '', city: '', address: '' },
    availableSpots: c.availableSpots,
    totalSpots: c.totalSpots,
    date: c.date,
    status: c.status,
    enrolledCount: c.enrolledCount,
  };
}

export const classService = {
  async getClasses(filters?: { date?: string; type?: string; studioId?: string }): Promise<Class[]> {
    const res = await api.get<{ data: any[] }>('/classes', { params: filters });
    return (res.data.data ?? []).map(adaptClass);
  },

  async getClassById(id: string): Promise<Class | undefined> {
    try {
      const res = await api.get<{ data: any }>(`/classes/${id}`);
      return adaptClass(res.data.data);
    } catch {
      return undefined;
    }
  },
};
