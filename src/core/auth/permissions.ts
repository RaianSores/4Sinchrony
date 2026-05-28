import type { Role, Permission } from '../types/role';
import type { User } from '../types/user';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  student: [
    'class:read',
    'class:book',
    'class:cancel',
    'purchase:create',
    'purchase:read',
    'card:manage',
    'profile:manage',
    'booking:read',
    'booking:create',
  ],
  teacher: [
    'class:read',
    'class:teach',
    'class:manage-session',
    'student:read',
    'attendance:manage',
    'checkin:perform',
    'metrics:read-personal',
    'profile:manage',
  ],
  admin: [
    'class:read',
    'class:book',
    'class:cancel',
    'class:teach',
    'class:manage-session',
    'class:manage-all',
    'purchase:create',
    'purchase:read',
    'card:manage',
    'profile:manage',
    'booking:read',
    'booking:create',
    'student:read',
    'student:manage',
    'teacher:manage',
    'studio:manage',
    'attendance:manage',
    'checkin:perform',
    'metrics:read-personal',
    'report:read-all',
    'settings:manage',
  ],
};

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
}

export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.some(p => hasPermission(user, p));
}

export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.every(p => hasPermission(user, p));
}
