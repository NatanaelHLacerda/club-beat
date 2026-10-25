// REQ-016 — formatação dos indicadores do cap. 13. Dado ausente é "—", nunca zero inventado.
export type Indicadores = {
  chegaram: number; respondidas_2du: number; chegaram_reuniao: number; reunioes: number; viraram_contrato: number
  dias_ate_contrato: number | null; recusadas_nao_combina: number; ativas_por_padrao: Record<string, number>
  receita_centavos: number | null; receita_sem_valor: number; renovadas: number; decididas_renovacao: number
  datas_a_total: number; datas_a_ocupadas: number; vencendo_sem_aviso: number
  nota_membros: number | null; nota_parceiro: number | null; reclamacoes_trimestre: number
  fechadas: { marca: string; padrao: string | null; valor_centavos: number | null; troca: boolean; inicio: string; fim: string }[]
}

export function percentual(parte: number, total: number): number | null {
  if (!total) return null
  return Math.round((parte / total) * 100)
}

export const textoPercentual = (p: number | null) => (p === null ? '—' : `${p}%`)
export const textoNumero = (n: number | null | undefined, sufixo = '') => (n === null || n === undefined ? '—' : `${n.toLocaleString('pt-BR')}${sufixo}`)

export type Comparacao = 'atingida' | 'abaixo' | 'sem_meta' | 'sem_dado'

// "maior é melhor" por padrão; para "dias até o contrato" e "reclamações", menor é melhor.
export function comparaMeta(valor: number | null, meta: number | null | undefined, menorEhMelhor = false): Comparacao {
  if (meta === null || meta === undefined) return 'sem_meta'
  if (valor === null) return 'sem_dado'
  return (menorEhMelhor ? valor <= meta : valor >= meta) ? 'atingida' : 'abaixo'
}
