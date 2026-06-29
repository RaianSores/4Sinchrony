import type { Role } from './role';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  role: Role;
  avatar?: string;
  credits?: number;
  phone?: string;
}
