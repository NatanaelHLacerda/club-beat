// REQ-008 — cardápio, proposta e motivos de Direção. O banco repete as travas.
import type { Padrao } from '../dados/tipos'

export type ItemCardapio = { padrao: Padrao; item: string; rotulo: string; descricao: string; maximo: number | null; ordem: number }
export type ItemProposta = { item: string; quantidade: number }

export type Formato = 'continua' | 'pontual' | 'evento' | 'aula_fechada'
export type TipoParceria = 'patrocinio' | 'industria' | 'servico' | 'troca'
export const rotuloFormato: Record<Formato, string> = { continua: 'Parceria contínua', pontual: 'Ativação pontual', evento: 'Evento', aula_fechada: 'Aula fechada' }
export const rotuloTipoParceria: Record<TipoParceria, string> = { patrocinio: 'Patrocínio', industria: 'Parceria com indústria', servico: 'Parceria de serviço (o Club paga)', troca: 'Troca de serviços' }

export type Proposta = {
  itens?: ItemProposta[]
  fora_do_cardapio?: string
  valor_mensal_centavos?: number | null
  troca?: boolean
  prazo_meses?: number | null
  inicio?: string
  exclusividade_categoria?: string
  nao_pode_perder?: boolean
  justificativa?: string
  promessa_revisao?: string
  enviada_em?: string
  prazo_resposta?: string
  aceite_em?: string
  direcao_aprovada_em?: string
}

export type Reuniao = {
  quando?: string; local?: string; presencial?: boolean; realizada?: boolean
  objetivo?: string; sucesso?: string; quem_decide?: string; datas_interesse?: string; pedidos_extra?: string; notas?: string
}

export type ConfirmacaoOperacoes = {
  capacidade?: boolean; equipe?: boolean; espaco_horario?: boolean; custo_centavos?: number | null; observacao?: string
  confirmada_em?: string; confirmada_por?: string
}

export const textosProposta = {
  semOperacoes: 'Operações precisa confirmar a viabilidade antes do envio.',
  semAceite: 'Anexe o aceite por escrito (e-mail basta).',
  semReuniao: 'Informe a data e o local da reunião.',
  naoPromete: 'A proposta nunca promete público mínimo, vendas ou retorno financeiro.',
} as const

export const itensDoPadrao = (cardapio: ItemCardapio[], padrao: Padrao | null) =>
  cardapio.filter((c) => c.padrao === (padrao ?? 'bronze')).sort((a, b) => a.ordem - b.ordem)

export function validarItens(cardapio: ItemCardapio[], padrao: Padrao | null, itens: ItemProposta[]): string | null {
  const meus = itensDoPadrao(cardapio, padrao)
  for (const i of itens) {
    const c = meus.find((m) => m.item === i.item)
    if (!c) return `Fora do cardápio do padrão: ${i.item}. Descreva em "fora do cardápio" para a Direção.`
    if (c.maximo !== null && i.quantidade > c.maximo) return `Acima do máximo do padrão: ${c.rotulo} até ${c.maximo}.`
  }
  return null
}

export type DadosDirecao = { padrao: Padrao | null; candidataMaster: boolean; tipo: TipoParceria | null; categoriaSensivel: boolean; proposta: Proposta }

// Mesma lista de motivos_direcao() no banco.
export function motivosDirecao(d: DadosDirecao): string[] {
  const m: string[] = []
  if (d.padrao === 'ouro') m.push('padrão Ouro')
  if (d.padrao === 'master') m.push('padrão Master')
  if (d.candidataMaster) m.push('candidata a Master')
  if (d.proposta.fora_do_cardapio?.trim()) m.push('fora do cardápio')
  if (d.proposta.exclusividade_categoria?.trim()) m.push('exclusividade')
  if (d.tipo === 'servico') m.push('o Club paga (parceria de serviço)')
  if (d.categoriaSensivel) m.push('categoria sensível')
  if (d.proposta.nao_pode_perder) m.push('parceiro que não pode perder')
  return m
}

export function respostaVencida(prazo: string | null | undefined, aceite: string | null | undefined, hoje: string): boolean {
  return Boolean(prazo && !aceite && hoje >= prazo)
}

export function retomarEmSeisMeses(hoje: string): string {
  const d = new Date(`${hoje}T12:00:00Z`)
  d.setUTCMonth(d.getUTCMonth() + 6)
  return d.toISOString().slice(0, 10)
}
