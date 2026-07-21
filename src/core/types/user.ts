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
  // Endereço (opcional) — necessário pro pagamento por cartão (Asaas exige CEP+número).
  // Preenchido via ViaCEP. Ver docs/DEMANDA_CADASTRO_ENDERECO_CLIENTE_BACKEND.md.
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}
