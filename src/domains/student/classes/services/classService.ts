import { Class } from '../../../../shared/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockClasses: Class[] = [
  {
    id: 'class_1',
    name: 'Velo Power',
    type: 'bike',
    instructor: 'Ádria',
    instructorAvatar: 'https://i.pravatar.cc/150?u=adria',
    startTime: '06:30',
    duration: 45,
    studio: { id: 'studio_1', name: 'Palmas', city: 'Palmas', address: 'Rua A, 100' },
    availableSpots: 12,
    totalSpots: 20,
    date: '2026-05-21',
    bikes: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, status: i < 8 ? 'occupied' : 'available' as const })),
  },
  {
    id: 'class_2',
    name: 'Velo Burn',
    type: 'bike',
    instructor: 'Wal',
    instructorAvatar: 'https://i.pravatar.cc/150?u=wal',
    startTime: '07:45',
    duration: 45,
    studio: { id: 'studio_1', name: 'Palmas', city: 'Palmas', address: 'Rua A, 100' },
    availableSpots: 5,
    totalSpots: 20,
    date: '2026-05-21',
    bikes: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, status: i < 15 ? 'occupied' : 'available' as const })),
  },
  {
    id: 'class_3',
    name: 'Velo Strength',
    type: 'bike',
    instructor: 'Valderi',
    instructorAvatar: 'https://i.pravatar.cc/150?u=valderi',
    startTime: '09:00',
    duration: 45,
    studio: { id: 'studio_1', name: 'Palmas', city: 'Palmas', address: 'Rua A, 100' },
    availableSpots: 18,
    totalSpots: 20,
    date: '2026-05-21',
    bikes: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, status: i < 2 ? 'occupied' : 'available' as const })),
  },
  {
    id: 'class_4',
    name: 'Jiu-Jitsu No-Gi',
    type: 'jiu-jitsu',
    instructor: 'Carlos',
    instructorAvatar: 'https://i.pravatar.cc/150?u=carlos',
    startTime: '07:00',
    duration: 60,
    studio: { id: 'studio_2', name: 'Boxe Centro', city: 'Palmas', address: 'Rua B, 200' },
    availableSpots: 15,
    totalSpots: 25,
    date: '2026-05-21',
  },
  {
    id: 'class_5',
    name: 'Boxe Iniciante',
    type: 'box',
    instructor: 'Rafael',
    instructorAvatar: 'https://i.pravatar.cc/150?u=rafael',
    startTime: '08:30',
    duration: 50,
    studio: { id: 'studio_2', name: 'Boxe Centro', city: 'Palmas', address: 'Rua B, 200' },
    availableSpots: 10,
    totalSpots: 20,
    date: '2026-05-21',
  },
  {
    id: 'class_6',
    name: 'Dança Contemporânea',
    type: 'danca',
    instructor: 'Marina',
    startTime: '10:00',
    duration: 55,
    studio: { id: 'studio_3', name: '4Sinchrony Experience Centro', city: 'Palmas', address: 'Rua C, 300' },
    availableSpots: 8,
    totalSpots: 15,
    date: '2026-05-21',
  },
  {
    id: 'class_7',
    name: 'Velo Power',
    type: 'bike',
    instructor: 'Ádria',
    startTime: '17:30',
    duration: 45,
    studio: { id: 'studio_1', name: 'Palmas', city: 'Palmas', address: 'Rua A, 100' },
    availableSpots: 3,
    totalSpots: 20,
    date: '2026-05-22',
    bikes: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, status: i < 17 ? 'occupied' : 'available' as const })),
  },
  {
    id: 'class_8',
    name: 'Velo Flow',
    type: 'bike',
    instructor: 'Wal',
    startTime: '18:45',
    duration: 45,
    studio: { id: 'studio_1', name: 'Palmas', city: 'Palmas', address: 'Rua A, 100' },
    availableSpots: 0,
    totalSpots: 20,
    date: '2026-05-22',
    bikes: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, status: 'occupied' as const })),
  },
];

export const classService = {
  async getClasses(filters?: { date?: string; type?: string; studioId?: string }): Promise<Class[]> {
    await delay(500);
    let result = [...mockClasses];
    if (filters?.date) result = result.filter(c => c.date === filters.date);
    if (filters?.type) result = result.filter(c => c.type === filters.type);
    if (filters?.studioId) result = result.filter(c => c.studio?.id === filters.studioId);
    return result;
  },

  async getClassById(id: string): Promise<Class | undefined> {
    await delay(400);
    return mockClasses.find(c => c.id === id);
  },
};
