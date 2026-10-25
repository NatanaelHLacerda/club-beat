// REQ-007 — revezamento, ficha de passagem e ordem da fila. O banco repete as travas.
import type { Padrao } from '../dados/tipos'

export const camposPassagem = [
  { id: 'busca', rotulo: 'O que a empresa busca' },
  { id: 'apresentado', rotulo: 'O que o Club apresentou (ofertas)' },
  { id: 'pediu_mais', rotulo: 'O que a empresa pediu a mais' },
  { id: 'prometido_rever', rotulo: 'O que prometemos rever depois' },
  { id: 'datas_interesse', rotulo: 'Datas de interesse' },
] as const

export type PrecisaDirecao = 'nao' | 'ouro_master' | 'fora' | 'nao_pode_perder'
export const rotuloPrecisaDirecao: Record<PrecisaDirecao, string> = {
  nao: 'Não', ouro_master: 'Ouro ou Master', fora: 'Fora do estabelecido', nao_pode_perder: 'Parceiro que não pode perder',
}

export type FichaPassagem = Partial<Record<(typeof camposPassagem)[number]['id'], string>> & {
  precisa_direcao?: PrecisaDirecao
  prazo_retorno?: string
}

export const textosPassagem = {
  motivoTroca: 'Informe o motivo da troca.',
  fichaIncompleta: 'Preencha a ficha de passagem antes de definir a Gerente 2.',
  semTriagem: 'Conclua a Triagem 2 antes de passar à Gerente.',
  semGerente: 'Nenhuma Gerente disponível.',
} as const

export function pendenciasPassagem(f: FichaPassagem): string[] {
  const faltam: string[] = camposPassagem.filter((c) => !f[c.id]?.trim()).map((c) => c.rotulo)
  if (!f.precisa_direcao) faltam.push('Precisa da Direção?')
  if (!f.prazo_retorno) faltam.push('Prazo combinado para o retorno')
  return faltam
}

// Gerentes disponíveis em ordem de nome; devolve a seguinte à última que recebeu por revezamento.
export function proximaNoRevezamento<T extends { id: string; nome: string }>(gerentes: T[], ultima: string | null): T | null {
  const lista = [...gerentes].sort((a, b) => a.nome.localeCompare(b.nome) || a.id.localeCompare(b.id))
  if (!lista.length) return null
  const pos = lista.findIndex((g) => g.id === ultima)
  return pos < 0 ? lista[0] : lista[(pos + 1) % lista.length]
}

// Ouro e candidatas a Master primeiro, depois Prata, depois Bronze; sem padrão por último.
export function ordemFila(padrao: Padrao | null, candidataMaster: boolean): number {
  if (candidataMaster || padrao === 'master') return 0
  if (padrao === 'ouro') return 1
  if (padrao === 'prata') return 2
  if (padrao === 'bronze') return 3
  return 4
}
