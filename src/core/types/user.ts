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
  // Quando o aluno é dependente de outro (pacote família), tem acesso limitado: não gerencia
  // dependentes/compras/cartões/planos (quem faz isso é o responsável). Depende do backend
  // expor `isDependent` em /auth/login e /auth/me — ver DEMANDA_DEPENDENTE_COLUNAS_VINCULO_BACKEND.md.
  isDependent?: boolean;
  responsibleStudentId?: string | null;
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
