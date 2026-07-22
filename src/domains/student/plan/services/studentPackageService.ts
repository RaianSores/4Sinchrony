import { api } from '../../../../core/http/api';

// "Pacote Ativo" do aluno (planos dinâmicos) — ver docs/pacotes/ESPECIFICACAO_API_PLANOS_DINAMICOS.md.
// Campos base pela spec; os denormalizados (nome do pacote/tier, créditos, benefícios) são
// lidos defensivamente pois o backend pode expô-los com nomes ligeiramente diferentes e ainda
// não foi possível ver a resposta de sucesso ao vivo (nenhum aluno tem pacote ativo enquanto o
// endpoint de compra `POST /packages/:id/purchase` não está implementado — 404 em 22/07).
export interface StudentPackage {
  id: string;
  packageId: string;
  status: 'active' | 'queued' | 'expired' | 'cancelled';
  purchasedAt: string;
  startDate: string;
  endDate: string;
  // denormalizados prováveis (exibição)
  packageName?: string;
  packageTypeName?: string; // o "plano"/categoria (Básico, Premium…)
  credits?: number;
  creditsRemaining?: number;
  benefits?: { id: string; name: string; icon?: string }[];
}

export const studentPackageService = {
  // Retorna o pacote ativo do aluno logado, ou null quando não há nenhum (a API responde 404
  // nesse caso — tratamos como "sem pacote", não como erro).
  async getMyActivePackage(): Promise<StudentPackage | null> {
    try {
      const res = await api.get<StudentPackage>('/students/me/package');
      return res.data ?? null;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },

  // Histórico completo de pacotes do aluno (ativos, na fila, expirados, cancelados).
  async getMyPackageHistory(studentId: string): Promise<StudentPackage[]> {
    const res = await api.get<{ data: StudentPackage[] } | StudentPackage[]>(`/api/students/${studentId}/packages`);
    const body = res.data as any;
    return Array.isArray(body) ? body : (body?.data ?? []);
  },

  // Compra de pacote com estratégia (purchaseStrategy definida no Package/PackageType). O backend
  // resolve se o pacote entra ativo agora ou vai pra fila (upgrade/downgrade/renovação etc.) e
  // devolve o StudentPackage resultante já com o status correto.
  // ATENÇÃO: `POST /packages/:id/purchase` ainda responde 404 em produção-de-testes (22/07/2026);
  // método pronto mas NÃO ligado ao fluxo de pagamento atual (que usa /payments/pix e /payments/card).
  async purchasePackage(packageId: string, dependentId?: string): Promise<StudentPackage> {
    const res = await api.post<StudentPackage>(`/packages/${packageId}/purchase`, {
      dependentId: dependentId || undefined,
    });
    return (res.data as any)?.data ?? res.data;
  },
};
