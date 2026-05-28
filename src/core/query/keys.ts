export const queryKeys = {
  teacher: {
    classes: {
      all: ['teacher', 'classes'] as const,
      byDate: (date: string) => ['teacher', 'classes', 'date', date] as const,
      today: ['teacher', 'classes', 'today'] as const,
      detail: (id: string) => ['teacher', 'classes', id] as const,
    },
    sessions: {
      current: (classId: string) => ['teacher', 'session', classId] as const,
    },
    attendance: {
      list: (classId: string) => ['teacher', 'attendance', classId] as const,
    },
    metrics: {
      all: ['teacher', 'metrics'] as const,
      monthly: (month: number, year: number) => ['teacher', 'metrics', month, year] as const,
    },
  },
  student: {
    classes: {
      all: ['student', 'classes'] as const,
      detail: (id: string) => ['student', 'classes', id] as const,
    },
    bookings: {
      all: ['student', 'bookings'] as const,
      history: ['student', 'bookings', 'history'] as const,
    },
  },
};
