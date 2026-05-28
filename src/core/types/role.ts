export type Role = 'student' | 'teacher' | 'admin';

export type Permission =
  | 'class:read'
  | 'class:book'
  | 'class:cancel'
  | 'class:teach'
  | 'class:manage-session'
  | 'class:manage-all'
  | 'purchase:create'
  | 'purchase:read'
  | 'card:manage'
  | 'profile:manage'
  | 'booking:read'
  | 'booking:create'
  | 'student:read'
  | 'student:manage'
  | 'teacher:manage'
  | 'studio:manage'
  | 'attendance:manage'
  | 'checkin:perform'
  | 'metrics:read-personal'
  | 'report:read-all'
  | 'settings:manage';
