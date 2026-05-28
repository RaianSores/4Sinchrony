export type AttendanceStatus = 'confirmed' | 'attended' | 'no_show';

export interface AttendanceRecord {
  id: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentAvatar?: string;
  date: string;
  time: string;
  status: AttendanceStatus;
  confirmedBy?: string;
  confirmedAt?: string;
  bikeNumber?: number;
}

export interface AttendanceUpdate {
  studentId: string;
  status: AttendanceStatus;
}
