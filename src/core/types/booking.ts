import type { Class } from './class';

export type BookingStatus = 'confirmed' | 'cancelled' | 'attended' | 'no_show';

export interface Booking {
  id: string;
  class: Class;
  classId: string;
  className: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  bikeNumber?: number;
  status: BookingStatus;
  bookedAt: string;
  checkedIn: boolean;
}
