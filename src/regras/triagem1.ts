// REQ-005 — primeira triagem. Mesma lista de itens_triagem1() e requisitos_triagem2() no banco.
export const itensTriagem1 = [
  { id: 'formulario', rotulo: 'Formulário completo' },
  { id: 'cnpj', rotulo: 'CNPJ válido e ativo' },
  { id: 'nome_cidade', rotulo: 'Nome e cidade conferem' },
  { id: 'site_instagram', rotulo: 'Site ou Instagram conferido' },
  { id: 'portfolio', rotulo: 'Portfólio anexado e abre' },
  { id: 'motivo', rotulo: 'Motivo da parceria preenchido' },
  { id: 'consentimento', rotulo: 'Consentimento marcado' },
  { id: 'categoria', rotulo: 'Categoria aceita' },
] as const

export type ItemTriagem1 = (typeof itensTriagem1)[number]['id']
export type MarcasTriagem1 = Partial<Record<ItemTriagem1, boolean>>
export type SituacaoCategoria = 'aceita' | 'nao_aceita' | 'sensivel'
export type SituacaoReceita = 'ativa' | 'baixada' | 'suspensa' | 'inapta' | 'nula'

export const rotuloSituacaoReceita: Record<SituacaoReceita, string> = { ativa: 'Ativa', baixada: 'Baixada', suspensa: 'Suspensa', inapta: 'Inapta', nula: 'Nula' }

export const textosTriagem1 = {
  naoAceita: 'Categoria não aceita',
  sensivel: 'Precisa de Jurídico e Direção',
  inativa: 'Empresa inativa',
} as const

export const diasSemRetorno = 7

export function pendenciasTriagem1(marcas: MarcasTriagem1): string[] {
  return itensTriagem1.filter((i) => !marcas[i.id]).map((i) => i.rotulo)
}

export function alertaCategoria(situacao: SituacaoCategoria | null | undefined): string | null {
  if (situacao === 'nao_aceita') return textosTriagem1.naoAceita
  if (situacao === 'sensivel') return textosTriagem1.sensivel
  return null
}

export function bloqueioCnpj(situacao: SituacaoReceita | null | undefined): string | null {
  return situacao && situacao !== 'ativa' ? textosTriagem1.inativa : null
}

// Dias corridos desde o pedido de informação; null quando não houve pedido.
export function diasDesdePedido(pedido: string | null | undefined, hoje: string): number | null {
  if (!pedido) return null
  return Math.round((Date.parse(`${hoje}T12:00:00Z`) - Date.parse(`${pedido}T12:00:00Z`)) / 86_400_000)
}

export function semRetorno(pedido: string | null | undefined, hoje: string): boolean {
  const dias = diasDesdePedido(pedido, hoje)
  return dias !== null && dias >= diasSemRetorno
}
