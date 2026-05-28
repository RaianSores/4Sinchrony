import type { ReactNode } from 'react';
import type { Role, Permission } from '../../types/role';
import { usePermission } from '../hooks/usePermission';

interface RoleGateProps {
  role?: Role | Role[];
  permission?: Permission | Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGate = ({ role, permission, children, fallback = null }: RoleGateProps) => {
  const { hasRole, hasPermission: checkPermission } = usePermission();

  if (role && !hasRole(role)) return <>{fallback}</>;
  if (permission && !checkPermission(permission)) return <>{fallback}</>;

  return <>{children}</>;
};
