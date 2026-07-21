import { api } from '../../../core/http/api';

// Categoria de pacote (ex.: Básico / Premium / Família). Criação/edição fica no ERP; o App
// só precisa LER pra popular o seletor no formulário de pacote. Ver
// docs/pacotes/ESPECIFICACAO_API_PLANOS_DINAMICOS.md.
export interface AdminPackageType {
  id: string;
  name: string;
  active: boolean;
  isFamily: boolean;
  rank?: number;
}

export const packageTypeAdminService = {
  async list(): Promise<AdminPackageType[]> {
    const res = await api.get<{ data: AdminPackageType[] }>('/api/package-types');
    return res.data.data ?? [];
  },
};
