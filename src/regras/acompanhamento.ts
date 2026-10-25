// REQ-011 — acompanhamento da parceria: contratado × feito, prazos de relatório e balanço, limites do mês.
import type { Padrao } from '../dados/tipos'

export type Contrapartida = { item: string; quantidade: number | null }
export type EntregaResumo = { item: string; data: string }
export type RelatorioResumo = { tipo: 'relatorio' | 'balanco'; referencia: string }

export const itensDeAcao = ['ativacao_1d', 'ativacao_3d', 'ativacao_4d', 'eventos']
export const exigePrivacidade = (item: string) => itensDeAcao.includes(item)

export const textosAcompanhamento = {
  privacidade: 'Confirme que a equipe do parceiro foi orientada sobre privacidade.',
  outroTipo: 'Este mês já tem outro tipo de ação.',
  quatroDias: 'Este mês já tem 4 dias de ação.',
  atrasado: 'relatório atrasado',
} as const

export function contratadoFeito(contrapartidas: Contrapartida[], entregas: EntregaResumo[]) {
  return contrapartidas.map((c) => ({ item: c.item, contratado: c.quantidade, feito: entregas.filter((e) => e.item === c.item).length }))
}

const iso = (d: Date) => d.toISOString().slice(0, 10)
const data = (s: string) => new Date(`${s}T12:00:00Z`)
function somarMeses(s: string, n: number): string {
  const d = data(s)
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + n)
  return iso(d)
}
function somarDias(s: string, n: number): string {
  const d = data(s)
  d.setUTCDate(d.getUTCDate() + n)
  return iso(d)
}
const primeiroDoMes = (s: string) => `${s.slice(0, 7)}-01`

export type Prazo = { referencia: string; prazo: string; atrasado: boolean }

// Ouro e Master: relatório de cada mês até o dia 10 do mês seguinte. Bronze e Prata: a cada 3 meses (10 dias depois do trimestre).
export function proximoRelatorio(padrao: Padrao | null, inicio: string, relatorios: RelatorioResumo[], hoje: string): Prazo | null {
  const feitos = new Set(relatorios.filter((r) => r.tipo === 'relatorio').map((r) => r.referencia))
  if (padrao === 'ouro' || padrao === 'master') {
    for (let ref = primeiroDoMes(inicio); ref <= primeiroDoMes(hoje); ref = somarMeses(ref, 1)) {
      if (feitos.has(ref)) continue
      const prazo = `${somarMeses(ref, 1).slice(0, 7)}-10`
      return { referencia: ref, prazo, atrasado: hoje > prazo }
    }
    return null
  }
  return proximoTrimestre(inicio, feitos, hoje)
}

export function proximoBalanco(inicio: string, relatorios: RelatorioResumo[], hoje: string): Prazo | null {
  return proximoTrimestre(inicio, new Set(relatorios.filter((r) => r.tipo === 'balanco').map((r) => r.referencia)), hoje)
}

function proximoTrimestre(inicio: string, feitos: Set<string>, hoje: string): Prazo | null {
  for (let k = 0; k < 40; k++) {
    const ref = k === 0 ? inicio : somarMeses(inicio, 3 * k).slice(0, 8) + inicio.slice(8)
    if (ref > hoje) return null
    if (feitos.has(ref)) continue
    const fimTrimestre = somarDias(somarMeses(inicio, 3 * (k + 1)).slice(0, 8) + inicio.slice(8), -1)
    const prazo = somarDias(fimTrimestre, 10)
    return { referencia: ref, prazo, atrasado: hoje > prazo }
  }
  return null
}

const grupoAcao = (item: string) => (item === 'eventos' ? 'evento' : item.startsWith('ativacao') ? 'ativacao' : null)

// Limites do Club no mês (DP-1101): um tipo de ação e 4 dias. Aviso, não bloqueio.
export function avisoLimiteMes(item: string, dia: string, doMes: EntregaResumo[]): string | null {
  const grupo = grupoAcao(item)
  if (!grupo) return null
  const acoes = doMes.filter((e) => e.data.slice(0, 7) === dia.slice(0, 7) && grupoAcao(e.item))
  if (acoes.some((e) => grupoAcao(e.item) !== grupo)) return textosAcompanhamento.outroTipo
  if (new Set(acoes.map((e) => e.data)).size >= 4 && !acoes.some((e) => e.data === dia)) return textosAcompanhamento.quatroDias
  return null
}

export function notaMedia(notas: (number | null)[]): number | null {
  const v = notas.filter((n): n is number => n !== null)
  return v.length ? Math.round((v.reduce((s, n) => s + n, 0) / v.length) * 10) / 10 : null
}
