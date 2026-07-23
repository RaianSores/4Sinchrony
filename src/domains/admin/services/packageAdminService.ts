import { api } from '../../../core/http/api';

export type PurchaseStrategy = 'block' | 'queue' | 'sum_credits' | 'sum_validity' | 'activate_immediately';

// Campos novos dos planos dinâmicos (opcionais até o backend implementar) — ver
// docs/pacotes/ESPECIFICACAO_API_PLANOS_DINAMICOS.md. As regras granulares por-pacote
// (limites, janelas, etc.) são editadas só no ERP; o App admin cobre os campos principais.
export interface PackageDynamicFields {
  unitId?: string | null;
  packageTypeId?: string;
  purchaseStrategy?: PurchaseStrategy;
  maxDependents?: number;
  creditsPerMember?: number | null;
  benefitIds?: string[];
}

export interface AdminPackage extends PackageDynamicFields {
  id: string;
  name: string;
  description?: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  validityDays: number;
  popular: boolean;
  active: boolean;
  displayOrder: number;
}

export interface PackageFormData extends PackageDynamicFields {
  name: string;
  description?: string;
  credits: number;
  price: number;
  validityDays: number;
  popular: boolean;
  active: boolean;
  displayOrder: number;
}

// Contratos confirmados ao vivo em 09/07/2026: list (`GET /api/packages`) vem envolto em
// `{data:[...]}`; getById/create/update/toggle retornam o objeto direto (sem wrapper) — mesmo
// padrão de todas as fases anteriores, e diferente do que o `packageService.ts` do ERP assume
// (ele trata create/update/toggle como envoltos em `{data}`, mas a API real não envolve — o
// ERP só não quebra porque descarta o retorno e sempre recarrega a lista inteira depois).
// Achado importante: `PUT` NÃO é um update parcial — testado ao vivo omitindo `active` do
// corpo e o backend zerou o campo pra `false` mesmo o pacote estando ativo antes de editar.
// Por isso `update` aqui sempre exige `active` explícito no payload (nunca opcional), pra
// nunca desativar um pacote sem querer ao salvar outros campos.
// `pricePerCredit` é sempre calculado pelo servidor (`price / credits`) — não é aceito no
// corpo do cliente, por isso nem faz parte de `PackageFormData`.
// Não existe endpoint de exclusão (DELETE responde 405) — só dá pra ativar/desativar via
// `PATCH /api/packages/:id/toggle`, que inverte o estado atual e retorna o objeto atualizado
// (diferente do toggle de Estúdios, que só devolve `{success:true}`) — aqui dá pra confiar na
// resposta pra atualizar o estado local sem precisar recarregar a lista.
export const packageAdminService = {
  async list(): Promise<AdminPackage[]> {
    const res = await api.get<{ data: AdminPackage[] }>('/api/packages');
    return res.data.data ?? [];
  },

  async getById(id: string): Promise<AdminPackage | undefined> {
    try {
      const res = await api.get<AdminPackage>(`/api/packages/${id}`);
      return res.data;
    } catch {
      return undefined;
    }
  },

  async create(data: PackageFormData): Promise<AdminPackage> {
    const res = await api.post<AdminPackage>('/api/packages', data);
    return res.data;
  },

  async update(id: string, data: PackageFormData): Promise<AdminPackage> {
    const res = await api.put<AdminPackage>(`/api/packages/${id}`, data);
    return res.data;
  },

  async toggle(id: string): Promise<AdminPackage> {
    const res = await api.patch<AdminPackage>(`/api/packages/${id}/toggle`);
    return res.data;
  },
};
