import { api } from '../../../../core/http/api';
import { Class } from '../../../../shared/types';
import { captureError } from '../../../../lib/sentry';

function adaptClass(c: any): Class {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    usesBikes: c.usesBikes,
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
  async getClassTypes(): Promise<{ label: string; value: string }[]> {
    try {
      const res = await api.get<{ data: { id: string; name: string; active: boolean }[] }>('/api/class-types');
      return (res.data.data ?? [])
        .filter(t => t.active)
        .map(t => ({ label: t.name, value: t.name.toLowerCase() }));
    } catch (error) {
      captureError(error);
      return [];
    }
  },

  async getClasses(filters?: { date?: string; type?: string; studioId?: string }): Promise<Class[]> {
    const res = await api.get<{ data: any[] }>('/classes', { params: filters });
    return (res.data.data ?? []).map(adaptClass);
  },

  // `GET /classes/:id` retorna o objeto no nível raiz (sem wrapper `data`), diferente de
  // `GET /classes` (lista). Mesmo padrão já confirmado ao vivo em
  // `teacherClassService.getClassById` (2026-07-02) — aqui reconfirmado ao vivo 14/07/2026.
  async getClassById(id: string): Promise<Class | undefined> {
    try {
      const res = await api.get<any>(`/classes/${id}`);
      return adaptClass(res.data);
    } catch (error) {
      captureError(error);
      return undefined;
    }
  },
};
