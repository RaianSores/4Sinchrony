import type { Role } from './role';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  cpf?: string;
  role: Role;
  avatar?: string;
  credits?: number;
  maxBookings?: number;
  phone?: string;
}
