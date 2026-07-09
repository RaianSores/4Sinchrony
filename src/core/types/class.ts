import type { Studio } from './studio';

export type ClassStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Class {
  id: string;
  name: string;
  type: string;
  classTypeId?: string;
  /** Denormalizado do ClassType — proposto em DEMANDA_CLASSTYPE_BIKE_FLAG_BACKEND.md, ainda não existe na API real. */
  usesBikes?: boolean;
  instructor: string;
  instructorAvatar?: string;
  teacherId?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  studio: Studio;
  studioId?: string;
  availableSpots: number;
  totalSpots: number;
  date: string;
  status?: ClassStatus;
  enrolledCount?: number;
  bikes?: import('./studio').Bike[];
}

export interface ClassSession {
  id: string;
  classId: string;
  status: ClassStatus;
  startedAt?: string;
  endedAt?: string;
  duration: number;
  instructorId: string;
  instructorName: string;
  className: string;
  studioName: string;
  enrolledCount: number;
  attendedCount: number;
}
