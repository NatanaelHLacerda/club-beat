// REQ-014 — situação de um prazo. O prazo vem de prazos_abertos() no banco.
export type SituacaoPrazo = 'no_prazo' | 'vence_hoje' | 'atrasado'

export const rotuloSituacaoPrazo: Record<SituacaoPrazo, string> = { no_prazo: 'No prazo', vence_hoje: 'Vence hoje', atrasado: 'Atrasado' }

export function situacaoDoPrazo(prazo: string, hoje: string): SituacaoPrazo {
  if (prazo < hoje) return 'atrasado'
  return prazo === hoje ? 'vence_hoje' : 'no_prazo'
}

export const ordemSituacao: Record<SituacaoPrazo, number> = { atrasado: 0, vence_hoje: 1, no_prazo: 2 }
