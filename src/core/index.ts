export { theme } from './theme';
export { api } from './http/api';
export { tokenStorage } from './storage';
export { queryClient } from './query';
export { featureFlags } from './features';
export { RealtimeProvider, useRealtime } from './ws/RealtimeProvider';

export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRole,
  RoleGate,
  usePermission,
} from './auth';

export { RoleResolver } from './navigation/RoleResolver';
export { StudentNavigator } from './navigation/student/StudentNavigator';
export { TeacherNavigator } from './navigation/teacher/TeacherNavigator';
export { AdminNavigator } from './navigation/admin/AdminNavigator';

export type {
  Role, Permission,
  User,
  Class, ClassSession, ClassStatus,
  Studio, Bike,
  Booking, BookingStatus,
  AttendanceRecord, AttendanceUpdate, AttendanceStatus,
  ClassPackage, Coupon, Purchase, PaymentResult,
  CardBrand, CardInfo, AddCardData,
} from './types';
