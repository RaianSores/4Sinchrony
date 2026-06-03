import type { Class } from './class';

export interface StudentProgress {
  classesAttended: number;
  classesGoal: number;
  streakWeeks: number;
  activeBookings: number;
  nextClass?: Class | null;
  credits: number;
}
