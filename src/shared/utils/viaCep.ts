export interface ViaCepAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string; // `localidade` no ViaCEP
  estado: string; // `uf` no ViaCEP
}

// Busca endereço a partir do CEP no ViaCEP (público, gratuito, sem chave).
// Retorna null quando o CEP é inválido ou não existe — quem chama decide o fallback,
// esta função nunca lança. No React Native não há CSP, o fetch funciona direto.
export async function fetchAddressByCep(cepRaw: string): Promise<ViaCepAddress | null> {
  const cep = cepRaw.replace(/\D/g, '');
  if (cep.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      cep: (data.cep ?? cep).replace(/\D/g, ''),
      logradouro: data.logradouro ?? '',
      complemento: data.complemento ?? '',
      bairro: data.bairro ?? '',
      cidade: data.localidade ?? '',
      estado: data.uf ?? '',
    };
  } catch {
    return null;
  }
}

// Máscara visual 00000-000. Guardamos sempre só os dígitos no estado.
export function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function cleanCep(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 8);
}

// 27 UFs para o select de estado.
export const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];
