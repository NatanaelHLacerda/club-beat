// REQ-035 — saudação da faixa do Início pela hora de São Paulo.
export type Saudacao = 'Bom dia' | 'Boa tarde' | 'Boa noite'

export function saudacao(agora: Date): Saudacao {
  const hora = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Sao_Paulo' }).format(agora))
  if (hora >= 5 && hora < 12) return 'Bom dia'
  if (hora >= 12 && hora < 18) return 'Boa tarde'
  return 'Boa noite'
}
