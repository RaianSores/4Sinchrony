import type { Class, ClassSession } from '../../../core/types/class';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockTeacherClasses: Class[] = [
  {
    id: 'class_1',
    name: 'Velo Power',
    type: 'bike',
    instructor: 'Ádria',
    instructorAvatar: 'https://i.pravatar.cc/150?u=adria',
    teacherId: 'teacher_456',
    startTime: '06:30',
    duration: 45,
    studio: { id: 'studio_1', name: 'Palmas', city: 'Palmas', address: 'Rua A, 100' },
    availableSpots: 12,
    totalSpots: 20,
    date: new Date().toISOString().split('T')[0],
    status: 'scheduled',
    enrolledCount: 8,
    bikes: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, status: i < 8 ? 'occupied' : 'available' })),
  },
  {
    id: 'class_3',
    name: 'Velo Strength',
    type: 'bike',
    instructor: 'Ádria',
    instructorAvatar: 'https://i.pravatar.cc/150?u=adria',
    teacherId: 'teacher_456',
    startTime: '09:00',
    duration: 45,
    studio: { id: 'studio_1', name: 'Palmas', city: 'Palmas', address: 'Rua A, 100' },
    availableSpots: 18,
    totalSpots: 20,
    date: new Date().toISOString().split('T')[0],
    status: 'scheduled',
    enrolledCount: 2,
    bikes: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, status: i < 2 ? 'occupied' : 'available' })),
  },
  {
    id: 'class_7',
    name: 'Velo Power',
    type: 'bike',
    instructor: 'Ádria',
    teacherId: 'teacher_456',
    startTime: '17:30',
    duration: 45,
    studio: { id: 'studio_1', name: 'Palmas', city: 'Palmas', address: 'Rua A, 100' },
    availableSpots: 3,
    totalSpots: 20,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'scheduled',
    enrolledCount: 17,
    bikes: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, status: i < 17 ? 'occupied' : 'available' })),
  },
  {
    id: 'class_8',
    name: 'Velo Flow',
    type: 'bike',
    instructor: 'Ádria',
    teacherId: 'teacher_456',
    startTime: '18:45',
    duration: 45,
    studio: { id: 'studio_1', name: 'Palmas', city: 'Palmas', address: 'Rua A, 100' },
    availableSpots: 0,
    totalSpots: 20,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'scheduled',
    enrolledCount: 20,
    bikes: Array.from({ length: 20 }, (_, i) => ({ number: i + 1, status: 'occupied' })),
  },
];

const mockSessions: Record<string, ClassSession> = {};

export const teacherClassService = {
  async getMyClasses(date?: string): Promise<Class[]> {
    await delay(500);
    let result = [...mockTeacherClasses];
    if (date) {
      result = result.filter(c => c.date === date);
    }
    return result;
  },

  async getTodayClasses(): Promise<Class[]> {
    await delay(400);
    const today = new Date().toISOString().split('T')[0];
    return mockTeacherClasses.filter(c => c.date === today);
  },

  async getClassById(id: string): Promise<Class | undefined> {
    await delay(400);
    return mockTeacherClasses.find(c => c.id === id);
  },

  async startClass(classId: string): Promise<ClassSession> {
    await delay(300);
    const cls = mockTeacherClasses.find(c => c.id === classId);
    if (!cls) throw new Error('Class not found');

    const session: ClassSession = {
      id: `session_${classId}`,
      classId: cls.id,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      duration: cls.duration,
      instructorId: cls.teacherId || '',
      instructorName: cls.instructor,
      className: cls.name,
      studioName: cls.studio.name,
      enrolledCount: cls.totalSpots - cls.availableSpots,
      attendedCount: 0,
    };

    mockSessions[classId] = session;
    return session;
  },

  async endClass(classId: string): Promise<ClassSession> {
    await delay(300);
    const session = mockSessions[classId];
    if (!session) throw new Error('No active session');

    session.status = 'completed';
    session.endedAt = new Date().toISOString();
    return session;
  },

  async getCurrentSession(classId: string): Promise<ClassSession | null> {
    await delay(200);
    return mockSessions[classId] || null;
  },
};
