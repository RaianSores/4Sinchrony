import { api } from '../../../core/http/api';
import type { Class, ClassSession } from '../../../core/types/class';

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

export const teacherClassService = {
  async getMyClasses(date?: string): Promise<Class[]> {
    const res = await api.get<{ data: any[] }>('/teachers/me/classes', {
      params: date ? { date } : {},
    });
    return (res.data.data ?? []).map(adaptClass);
  },

  async getTodayClasses(): Promise<Class[]> {
    const res = await api.get<{ data: any[] }>('/teachers/me/classes/today');
    return (res.data.data ?? []).map(adaptClass);
  },

  async getClassById(id: string): Promise<Class | undefined> {
    try {
      const res = await api.get<{ data: any }>(`/teachers/me/classes/${id}`);
      return adaptClass(res.data.data);
    } catch {
      return undefined;
    }
  },

  async startClass(classId: string): Promise<ClassSession> {
    const res = await api.post<{ data: ClassSession }>(`/classes/${classId}/session/start`);
    return res.data.data;
  },

  async endClass(classId: string): Promise<ClassSession> {
    const res = await api.post<{ data: ClassSession }>(`/classes/${classId}/session/end`);
    return res.data.data;
  },

  async getCurrentSession(classId: string): Promise<ClassSession | null> {
    const res = await api.get<{ data: ClassSession | null }>(`/classes/${classId}/session`);
    return res.data.data;
  },
};
