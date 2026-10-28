// REQ-006 — porte, pontos, padrão e aderência (documento-base cap. 6 e 7).
// REQ-041 — faixas, notas e pontos da ficha vêm da configuração (tela Manutenção); os valores daqui são o padrão de fábrica.
import { formatarDinheiro } from './formato'
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

export const idsCriterios = ['porte', 'investimento', 'duracao', 'marca', 'contrapartidas'] as const
export type CriterioPontos = (typeof idsCriterios)[number]
// Cada critério guarda a OPÇÃO escolhida (1, 2 ou 3); quanto ela vale em pontos vem da configuração.
export type Pontos = Partial<Record<CriterioPontos, 1 | 2 | 3>>
export type FaixaInvestimento = 'bronze' | 'prata' | 'ouro'

export type OpcaoPontos = { rotulo: string; pontos: number }
export type CriterioConfig = { id: CriterioPontos; rotulo: string; opcoes: OpcaoPontos[] }
// Soma < minimo: sem padrão. Até bronze_ate: Bronze. Até prata_ate: Prata. Acima: Ouro (Master nunca sai dos pontos).
export type CortesPadrao = { minimo: number; bronze_ate: number; prata_ate: number }
export type FaixaValor = { de: number | null; ate: number | null }
// Valores em centavos; null = a Direção ainda não definiu (aparece "R$ …").
export type FaixasInvestimento = { bronze: FaixaValor; prata: FaixaValor; ouro: { de: number | null } }
export type ConfigPontuacao = { criterios: CriterioConfig[]; cortes: CortesPadrao; investimento: FaixasInvestimento }

export const limitePontosPorOpcao = 10

export const chavesPontuacao = { criterios: 'pontuacao_criterios', cortes: 'pontuacao_cortes', investimento: 'pontuacao_investimento' } as const

const opcoes = (...itens: [string, number][]): OpcaoPontos[] => itens.map(([rotulo, pontos]) => ({ rotulo, pontos }))

// Padrão de fábrica: idêntico às regras do documento-base (cap. 7). Mesmos valores do seed das migrations.
export const configPontuacaoPadrao: ConfigPontuacao = {
  criterios: [
    { id: 'porte', rotulo: 'Porte', opcoes: opcoes(['Pequena', 1], ['Média I', 2], ['Média II ou grande', 3]) },
    { id: 'investimento', rotulo: 'Investimento proposto', opcoes: opcoes(['Faixa Bronze', 1], ['Faixa Prata', 2], ['Faixa Ouro', 3]) },
    { id: 'duracao', rotulo: 'Duração pretendida', opcoes: opcoes(['Até 6 meses', 1], ['12 meses', 2], ['Mais de 12 meses', 3]) },
    { id: 'marca', rotulo: 'Força da marca', opcoes: opcoes(['Conhecida no bairro ou na cidade', 1], ['Conhecida na região', 2], ['Conhecida em todo o país', 3]) },
    { id: 'contrapartidas', rotulo: 'Profundidade das contrapartidas', opcoes: opcoes(['Telas e poucas ativações', 1], ['Ativações e eventos do Club', 2], ['Calendário próprio ou exclusividade', 3]) },
  ],
  cortes: { minimo: 5, bronze_ate: 7, prata_ate: 11 },
  investimento: { bronze: { de: null, ate: null }, prata: { de: null, ate: null }, ouro: { de: null } },
}

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

// Pontos que a opção escolhida vale. Sem escolha: 0.
export function pontosDaOpcao(criterio: CriterioConfig, escolha: number | undefined): number {
  return escolha ? (criterio.opcoes[escolha - 1]?.pontos ?? 0) : 0
}

export const somaPontos = (p: Pontos, criterios: CriterioConfig[] = configPontuacaoPadrao.criterios) =>
  criterios.reduce((s, c) => s + pontosDaOpcao(c, p[c.id]), 0)
export const pontosCompletos = (p: Pontos, criterios: CriterioConfig[] = configPontuacaoPadrao.criterios) => criterios.every((c) => p[c.id])

export const pontuacaoMinima = (criterios: CriterioConfig[]) => criterios.reduce((s, c) => s + Math.min(...c.opcoes.map((o) => o.pontos)), 0)
export const pontuacaoMaxima = (criterios: CriterioConfig[]) => criterios.reduce((s, c) => s + Math.max(...c.opcoes.map((o) => o.pontos)), 0)

export function padraoPorPontos(soma: number, cortes: CortesPadrao = configPontuacaoPadrao.cortes): Padrao | null {
  if (soma < cortes.minimo) return null
  if (soma <= cortes.bronze_ate) return 'bronze'
  if (soma <= cortes.prata_ate) return 'prata'
  return 'ouro'
}

export type FaixaDePontos = { padrao: 'bronze' | 'prata' | 'ouro'; de: number; ate: number }

// As três faixas como intervalos fechados, para mostrar "Bronze 5 a 7 · Prata 8 a 11 · Ouro 12 a 15".
export function faixasDePontos(config: ConfigPontuacao = configPontuacaoPadrao): FaixaDePontos[] {
  const { minimo, bronze_ate, prata_ate } = config.cortes
  return [
    { padrao: 'bronze', de: minimo, ate: bronze_ate },
    { padrao: 'prata', de: bronze_ate + 1, ate: prata_ate },
    { padrao: 'ouro', de: prata_ate + 1, ate: pontuacaoMaxima(config.criterios) },
  ]
}

export type ResultadoPadrao = { pontos: number; porPontos: Padrao | null; final: Padrao | null; limitadoPeloInvestimento: boolean }

export function padraoFinal(p: Pontos, faixa: FaixaInvestimento | null, config: ConfigPontuacao = configPontuacaoPadrao): ResultadoPadrao {
  const pontos = somaPontos(p, config.criterios)
  const porPontos = pontosCompletos(p, config.criterios) ? padraoPorPontos(pontos, config.cortes) : null
  if (!porPontos || !faixa) return { pontos, porPontos, final: null, limitadoPeloInvestimento: false }
  const menor = ordemPadrao.indexOf(faixa) < ordemPadrao.indexOf(porPontos) ? faixa : porPontos
  return { pontos, porPontos, final: menor, limitadoPeloInvestimento: menor !== porPontos }
}

// "Faixa Prata (R$ 5.000,00 a R$ 9.000,00)"; sem valor definido pela Direção, "R$ …" (DP-0601).
export function rotuloFaixaInvestimento(faixa: FaixaInvestimento, f: FaixasInvestimento = configPontuacaoPadrao.investimento): string {
  const nome = { bronze: 'Faixa Bronze', prata: 'Faixa Prata', ouro: 'Faixa Ouro' }[faixa]
  if (faixa === 'ouro') return `${nome} (a partir de ${formatarDinheiro(f.ouro.de)})`
  const { de, ate } = f[faixa]
  if (de !== null && ate !== null) return `${nome} (${formatarDinheiro(de)} a ${formatarDinheiro(ate)})`
  if (ate !== null) return `${nome} (até ${formatarDinheiro(ate)})`
  if (de !== null) return `${nome} (a partir de ${formatarDinheiro(de)})`
  return `${nome} (R$ …)`
}

// ── Validação da configuração (o banco repete em salvar_config_pontuacao) ──

const inteiro = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n)
const valorOuNulo = (n: number | null) => n === null || (inteiro(n) && n >= 0)

export function validarConfigPontuacao(c: ConfigPontuacao): string[] {
  const erros: string[] = []

  for (const id of idsCriterios) {
    const crit = c.criterios.find((x) => x.id === id)
    if (!crit) { erros.push(`Falta o critério "${id}".`); continue }
    const nome = crit.rotulo.trim() || id
    if (!crit.rotulo.trim()) erros.push(`Dê um nome ao critério "${id}".`)
    if (crit.opcoes.length !== 3) { erros.push(`${nome}: são três opções por critério.`); continue }
    crit.opcoes.forEach((o, i) => {
      if (!o.rotulo.trim()) erros.push(`${nome}: descreva a opção ${i + 1}.`)
      if (!inteiro(o.pontos) || o.pontos < 0 || o.pontos > limitePontosPorOpcao) erros.push(`${nome}: os pontos da opção ${i + 1} vão de 0 a ${limitePontosPorOpcao}.`)
    })
    if (crit.opcoes.every((o) => inteiro(o.pontos)) && (crit.opcoes[0].pontos > crit.opcoes[1].pontos || crit.opcoes[1].pontos > crit.opcoes[2].pontos)) {
      erros.push(`${nome}: cada opção vale o mesmo ou mais pontos que a anterior.`)
    }
  }

  const { minimo, bronze_ate, prata_ate } = c.cortes
  if (![minimo, bronze_ate, prata_ate].every(inteiro)) {
    erros.push('Os cortes de pontos precisam ser números inteiros.')
  } else if (erros.length === 0) {
    const maximo = pontuacaoMaxima(c.criterios)
    if (minimo < 0) erros.push('A pontuação mínima não pode ser negativa.')
    if (bronze_ate < minimo) erros.push('O fim da faixa Bronze não pode ser menor que a pontuação mínima.')
    if (prata_ate <= bronze_ate) erros.push('O fim da faixa Prata precisa ser maior que o fim da Bronze.')
    if (prata_ate >= maximo) erros.push(`O fim da faixa Prata precisa ser menor que a pontuação máxima (${maximo}) para sobrar pontos ao Ouro.`)
  }

  const { bronze, prata, ouro } = c.investimento
  const todos = [bronze.de, bronze.ate, prata.de, prata.ate, ouro.de]
  if (!todos.every(valorOuNulo)) {
    erros.push('Os valores das faixas de investimento precisam ser positivos (ou ficar em branco).')
  } else {
    if (bronze.de !== null && bronze.ate !== null && bronze.de > bronze.ate) erros.push('Bronze: o valor inicial é maior que o final.')
    if (prata.de !== null && prata.ate !== null && prata.de > prata.ate) erros.push('Prata: o valor inicial é maior que o final.')
    const cresce: [number | null, number | null, string][] = [
      [bronze.ate, prata.de, 'A faixa Prata precisa começar acima do fim da Bronze.'],
      [prata.ate, ouro.de, 'A faixa Ouro precisa começar acima do fim da Prata.'],
    ]
    for (const [antes, depois, msg] of cresce) if (antes !== null && depois !== null && depois <= antes) erros.push(msg)
  }
  return erros
}

type LinhaParametro = { chave: string; valor: unknown }

// Monta a configuração a partir das linhas de `parametros`. Parte ausente ou inválida cai no padrão de fábrica:
// uma configuração quebrada nunca trava a Triagem 2.
export function lerConfigPontuacao(linhas: LinhaParametro[]): ConfigPontuacao {
  const valorDe = (chave: string) => linhas.find((l) => l.chave === chave)?.valor
  const bruto = valorDe(chavesPontuacao.criterios)
  const criterios = Array.isArray(bruto) ? (bruto as CriterioConfig[]) : configPontuacaoPadrao.criterios
  const cortesBrutos = valorDe(chavesPontuacao.cortes) as Partial<CortesPadrao> | null | undefined
  const cortes = cortesBrutos && typeof cortesBrutos === 'object'
    ? { ...configPontuacaoPadrao.cortes, ...cortesBrutos }
    : configPontuacaoPadrao.cortes
  const investBruto = valorDe(chavesPontuacao.investimento) as Partial<FaixasInvestimento> | null | undefined
  const investimento: FaixasInvestimento = {
    bronze: { ...configPontuacaoPadrao.investimento.bronze, ...(investBruto?.bronze ?? {}) },
    prata: { ...configPontuacaoPadrao.investimento.prata, ...(investBruto?.prata ?? {}) },
    ouro: { ...configPontuacaoPadrao.investimento.ouro, ...(investBruto?.ouro ?? {}) },
  }
  const lida: ConfigPontuacao = { criterios, cortes, investimento }
  if (validarConfigPontuacao(lida).length === 0) return lida
  // Só os critérios e cortes derrubam o cálculo; valores de investimento inválidos viram "R$ …".
  const semInvestimento = { criterios, cortes, investimento: configPontuacaoPadrao.investimento }
  if (validarConfigPontuacao(semInvestimento).length === 0) return semInvestimento
  return configPontuacaoPadrao
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
