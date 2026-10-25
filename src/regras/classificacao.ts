// REQ-006 — porte, pontos, padrão e aderência (documento-base cap. 6 e 7).
import type { Padrao, Porte } from '../dados/tipos'

const rotulosPorte: Record<Porte, string> = { pequena: 'Pequena', media1: 'Média I', media2: 'Média II', grande: 'Grande' }
const ordemPorte: Porte[] = ['pequena', 'media1', 'media2', 'grande']
const maiorPorte = (a: Porte, b: Porte) => (ordemPorte.indexOf(a) >= ordemPorte.indexOf(b) ? a : b)

// Faixas do formulário (src/dados/campos.ts) → porte pelo faturamento. Limite da pequena: R$ 4,8 mi (DP-0602).
export function porteDoFaturamento(faixa: string | null | undefined): Porte | null {
  switch (faixa) {
    case 'até R$ 360 mil':
    case 'R$ 360 mil a R$ 4,8 mi': return 'pequena'
    case 'R$ 4,8 mi a R$ 90 mi': return 'media1'
    case 'R$ 90 mi a R$ 300 mi': return 'media2'
    case 'acima de R$ 300 mi': return 'grande'
    default: return null
  }
}

// Funcionários (SEBRAE/IBGE). "Média" pelos funcionários conta como Média I.
export function porteDosFuncionarios(faixa: string | null | undefined, industria: boolean): Porte | null {
  const limites = industria
    ? { 'até 9': 'pequena', '10 a 49': 'pequena', '50 a 99': 'pequena', '100 a 499': 'media1', '500 ou mais': 'grande' }
    : { 'até 9': 'pequena', '10 a 49': 'pequena', '50 a 99': 'media1', '100 a 499': 'grande', '500 ou mais': 'grande' }
  return (faixa && (limites as Record<string, Porte>)[faixa]) || null
}

export type EntradaPorte = {
  faturamento: string | null | undefined
  funcionarios: string | null | undefined
  industria?: boolean
  receitaPorte?: 'ME' | 'EPP' | 'demais' | null
  grupoFaixa?: string | null
}

export type ResultadoPorte = { porte: Porte | null; nota: string | null; provisorio: boolean }

export function classificarPorte(e: EntradaPorte): ResultadoPorte {
  const pelaReceitaNaoPequena = e.receitaPorte === 'demais'
  const pf = porteDoFaturamento(e.grupoFaixa || e.faturamento)
  const pu = porteDosFuncionarios(e.funcionarios, Boolean(e.industria))
  const notas: string[] = []
  if (e.grupoFaixa) notas.push('classificada pelo grupo')

  if (!pf) {
    let porte = pu
    if (porte === 'pequena' && pelaReceitaNaoPequena) { porte = 'media1'; notas.push('Receita indica "demais": não é pequena') }
    return { porte, nota: notas.join(' · ') || null, provisorio: true }
  }
  let porte = pu ? maiorPorte(pf, pu) : pf
  if (pu && pu !== pf) {
    notas.push(porte === pu ? `divergência: faturamento indica ${rotulosPorte[pf]}` : `divergência: funcionários indicam ${rotulosPorte[pu]}`)
  }
  if (porte === 'pequena' && pelaReceitaNaoPequena) { porte = 'media1'; notas.push('Receita indica "demais": não é pequena') }
  return { porte, nota: notas.join(' · ') || null, provisorio: false }
}

// ── Pontos e padrão ──────────────────────────────────────────────

export const criteriosPontos = [
  { id: 'porte', rotulo: 'Porte', opcoes: ['Pequena', 'Média I', 'Média II ou grande'] },
  { id: 'investimento', rotulo: 'Investimento proposto', opcoes: ['Faixa Bronze', 'Faixa Prata', 'Faixa Ouro'] },
  { id: 'duracao', rotulo: 'Duração pretendida', opcoes: ['Até 6 meses', '12 meses', 'Mais de 12 meses'] },
  { id: 'marca', rotulo: 'Força da marca', opcoes: ['Conhecida no bairro ou na cidade', 'Conhecida na região', 'Conhecida em todo o país'] },
  { id: 'contrapartidas', rotulo: 'Profundidade das contrapartidas', opcoes: ['Telas e poucas ativações', 'Ativações e eventos do Club', 'Calendário próprio ou exclusividade'] },
] as const

export type CriterioPontos = (typeof criteriosPontos)[number]['id']
export type Pontos = Partial<Record<CriterioPontos, 1 | 2 | 3>>
export type FaixaInvestimento = 'bronze' | 'prata' | 'ouro'

const ordemPadrao: Padrao[] = ['bronze', 'prata', 'ouro', 'master']

export function pontosSugeridos(porte: Porte | null, faixa: FaixaInvestimento | null, duracao: string | null | undefined): Pontos {
  const p: Pontos = {}
  if (porte) p.porte = porte === 'pequena' ? 1 : porte === 'media1' ? 2 : 3
  if (faixa) p.investimento = faixa === 'bronze' ? 1 : faixa === 'prata' ? 2 : 3
  if (duracao === 'piloto curto' || duracao === '6 meses') p.duracao = 1
  else if (duracao === '12 meses') p.duracao = 2
  else if (duracao === 'mais de 12 meses') p.duracao = 3
  return p
}

export const somaPontos = (p: Pontos) => criteriosPontos.reduce((s, c) => s + (p[c.id] ?? 0), 0)
export const pontosCompletos = (p: Pontos) => criteriosPontos.every((c) => p[c.id])

export function padraoPorPontos(soma: number): Padrao | null {
  if (soma < 5) return null
  if (soma <= 7) return 'bronze'
  if (soma <= 11) return 'prata'
  return 'ouro'
}

export type ResultadoPadrao = { pontos: number; porPontos: Padrao | null; final: Padrao | null; limitadoPeloInvestimento: boolean }

export function padraoFinal(p: Pontos, faixa: FaixaInvestimento | null): ResultadoPadrao {
  const pontos = somaPontos(p)
  const porPontos = pontosCompletos(p) ? padraoPorPontos(pontos) : null
  if (!porPontos || !faixa) return { pontos, porPontos, final: null, limitadoPeloInvestimento: false }
  const menor = ordemPadrao.indexOf(faixa) < ordemPadrao.indexOf(porPontos) ? faixa : porPontos
  return { pontos, porPontos, final: menor, limitadoPeloInvestimento: menor !== porPontos }
}

// ── Aderência ao membro ──────────────────────────────────────────

export const criteriosAderencia = [
  { id: 'visao', rotulo: 'Visão compartilhada', pergunta: 'Os valores da marca conversam com os do Club e com o jeito de cuidar do membro?' },
  { id: 'hospitalidade', rotulo: 'Hospitalidade', pergunta: 'Como a marca trata as pessoas (site, redes, avaliações)?' },
  { id: 'membro_primeiro', rotulo: 'O membro primeiro', pergunta: 'Faz sentido para o membro? Se não faz, não entra.' },
  { id: 'longo_prazo', rotulo: 'Longo prazo', pergunta: 'A empresa quer construir e evoluir, ou só uma ação isolada?' },
  { id: 'viabilidade', rotulo: 'Viabilidade para o Club', pergunta: 'O Club consegue cumprir o que a empresa vai pedir? (Operações confirma antes da proposta.)' },
] as const

export type CriterioAderencia = (typeof criteriosAderencia)[number]['id']
export type RespostaAderencia = 'sim' | 'em_parte' | 'nao'
export type Aderencia = Partial<Record<CriterioAderencia, RespostaAderencia>>

export const textosClassificacao = {
  reprovada: 'Não combina com o membro: propor recusa com A5.',
  limitado: 'limitado pelo investimento',
  estudo: 'Escreva o estudo da empresa para concluir.',
  master: 'Candidata a Master: a Direção decide.',
} as const

export function avaliarAderencia(a: Aderencia): { reprovada: boolean; completa: boolean } {
  const naos = criteriosAderencia.filter((c) => a[c.id] === 'nao').length
  return { reprovada: naos >= 2 || a.membro_primeiro === 'nao', completa: criteriosAderencia.every((c) => a[c.id]) }
}
