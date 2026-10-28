// REQ-044 — abas de Negociação, derivadas da etapa e da proposta (nada novo no banco).
//  · Reuniões Agendadas: etapa "Reunião marcada", ordenadas pela data.
//  · Propostas em Análise: proposta sendo montada/confirmada (Operações) ou com a Direção — ainda não está com a empresa.
//  · Propostas em Negociação: proposta já enviada à empresa e sem aceite por escrito.
import type { Empresa } from '../dados/tipos'

export type AbaNegociacao = 'analise' | 'negociacao' | 'reunioes'

export const rotuloAbaNegociacao: Record<AbaNegociacao, string> = {
  analise: 'Propostas em Análise',
  negociacao: 'Propostas em Negociação',
  reunioes: 'Reuniões Agendadas',
}

type Base = Pick<Empresa, 'etapa' | 'proposta' | 'reuniao'>

export function abaDaNegociacao(e: Base): AbaNegociacao | null {
  if (e.etapa === 'reuniao') return 'reunioes'
  if (e.etapa === 'direcao') return 'analise'
  if (e.etapa === 'proposta') return e.proposta?.enviada_em && !e.proposta?.aceite_em ? 'negociacao' : 'analise'
  return null
}

export function separarNegociacao<T extends Base>(empresas: T[]): Record<AbaNegociacao, T[]> {
  const saida: Record<AbaNegociacao, T[]> = { analise: [], negociacao: [], reunioes: [] }
  for (const e of empresas) {
    const aba = abaDaNegociacao(e)
    if (aba) saida[aba].push(e)
  }
  // Reunião mais próxima primeiro; sem data vai para o fim.
  saida.reunioes.sort((a, b) => (a.reuniao?.quando ?? '9999').localeCompare(b.reuniao?.quando ?? '9999'))
  return saida
}

// "2026-10-26T14:00" (datetime-local, hora do Club) → "26/10/2026 14:00". Sem data: null.
export function quandoLegivel(quando: string | undefined | null): string | null {
  const m = quando?.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}:\d{2}))?/)
  return m ? `${m[3]}/${m[2]}/${m[1]}${m[4] ? ` ${m[4]}` : ''}` : null
}

// Passou do prazo de resposta da proposta enviada (datas AAAA-MM-DD).
export function respostaAtrasada(e: Base, hoje: string): boolean {
  const prazo = e.proposta?.prazo_resposta
  return Boolean(abaDaNegociacao(e) === 'negociacao' && prazo && hoje > prazo)
}
