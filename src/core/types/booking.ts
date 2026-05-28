import type { Class } from './class';

export type BookingStatus = 'confirmed' | 'cancelled' | 'attended' | 'no_show';

export interface Booking {
  id: string;
  class: Class;
  classId?: string;
  studentId?: string;
  studentName?: string;
  bikeNumber?: number;
  status: BookingStatus;
  bookedAt: string;
  checkedIn?: boolean;
}
