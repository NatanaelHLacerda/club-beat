// REQ-018 — variação "vs mês anterior" dos cartões de número.
export type Variacao = { percentual: number | null; direcao: 'sobe' | 'desce' | 'igual' | null }

export function calcularVariacao(atual: number | null | undefined, anterior: number | null | undefined): Variacao {
  if (atual === null || atual === undefined || anterior === null || anterior === undefined || anterior === 0) {
    return { percentual: null, direcao: null }
  }
  const percentual = Math.round(((atual - anterior) / Math.abs(anterior)) * 100)
  return { percentual, direcao: percentual > 0 ? 'sobe' : percentual < 0 ? 'desce' : 'igual' }
}

export function textoVariacao(v: Variacao): string {
  if (v.percentual === null) return '—'
  return `${v.percentual > 0 ? '+' : ''}${v.percentual}%`
}
