import { useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import type { Role, Permission } from '../../types/role';
import { hasPermission as checkPermission, hasAnyPermission, hasAllPermissions, getPermissionsForRole } from '../permissions';

export function usePermission() {
  const user = useAuthStore(state => state.user);

  return useMemo(() => ({
    user,
    isAuthenticated: !!user,

    hasRole(role: Role | Role[]): boolean {
      if (!user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(user.role);
    },

    hasPermission(permission: Permission | Permission[]): boolean {
      if (!user) return false;
      const permissions = Array.isArray(permission) ? permission : [permission];
      if (permissions.length === 1) return checkPermission(user, permissions[0]);
      return hasAllPermissions(user, permissions);
    },

    hasAnyPermission(permissions: Permission[]): boolean {
      return hasAnyPermission(user, permissions);
    },

    permissions(): Permission[] {
      if (!user) return [];
      return getPermissionsForRole(user.role);
    },

    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
  }), [user]);
}
