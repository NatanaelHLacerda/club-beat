// REQ-004 — etapas do funil. Mesmas regras de mover_etapa no banco; aqui para a tela avisar antes.
export type Etapa =
  | 'recebida' | 'triagem1' | 'triagem2' | 'reuniao' | 'proposta' | 'direcao'
  | 'contrato' | 'ativa' | 'renovacao' | 'encerrada' | 'espera' | 'recusada'

export const etapasDoFunil: Etapa[] = [
  'recebida', 'triagem1', 'triagem2', 'reuniao', 'proposta', 'direcao', 'contrato', 'ativa', 'renovacao', 'encerrada',
]
export const saidas: Etapa[] = ['espera', 'recusada']
export const todasEtapas: Etapa[] = [...etapasDoFunil, ...saidas]

export const rotuloEtapa: Record<Etapa, string> = {
  recebida: 'Recebida',
  triagem1: 'Triagem 1',
  triagem2: 'Triagem 2',
  reuniao: 'Reunião marcada',
  proposta: 'Em proposta',
  direcao: 'Com a Direção',
  contrato: 'Em contrato',
  ativa: 'Ativa',
  renovacao: 'Em renovação',
  encerrada: 'Encerrada',
  espera: 'Em espera',
  recusada: 'Recusada',
}

export const mensagensEtapa = {
  semMotivo: 'Informe o motivo da saída.',
  semRetomar: 'Informe a data para retomar.',
  ativa: 'A parceria só fica ativa ao registrar a assinatura do contrato.',
  direcao: 'O caso vai para a Direção pela porta da Direção, na proposta.',
  saidaDepoisDeAtiva: 'Parceria ativa não sai do funil por aqui: use a renovação ou o encerramento.',
} as const

export const exigeMotivo = (para: Etapa) => saidas.includes(para)
export const exigeRetomar = (para: Etapa) => para === 'espera'

// Bloqueios que não dependem dos dados da empresa. Devolve a mensagem ou null.
export function bloqueioDeMudanca(de: Etapa, para: Etapa): string | null {
  if (para === 'ativa') return mensagensEtapa.ativa
  if (para === 'direcao') return mensagensEtapa.direcao
  if (saidas.includes(para) && ['ativa', 'renovacao', 'encerrada'].includes(de)) return mensagensEtapa.saidaDepoisDeAtiva
  return null
}

export function validarSaida(para: Etapa, motivo: string, retomar: string): string | null {
  if (exigeMotivo(para) && !motivo.trim()) return mensagensEtapa.semMotivo
  if (exigeRetomar(para) && !retomar) return mensagensEtapa.semRetomar
  return null
}

// Para onde a tela oferece mover a partir de uma etapa (o banco confere o resto).
export function destinosPossiveis(de: Etapa): Etapa[] {
  return todasEtapas.filter((e) => e !== de && bloqueioDeMudanca(de, e) === null)
}

// REQ-029 — grupo visual da coluna no quadro: dá cor à faixa sem mudar regra de etapa.
export type GrupoEtapa = 'entrada' | 'andamento' | 'decisao' | 'fechado' | 'saida'
export function grupoDaEtapa(e: Etapa): GrupoEtapa {
  if (e === 'reuniao' || e === 'proposta') return 'andamento'
  if (e === 'direcao' || e === 'contrato') return 'decisao'
  if (e === 'ativa' || e === 'renovacao') return 'fechado'
  if (e === 'espera' || e === 'recusada') return 'saida'
  return 'entrada'
}
