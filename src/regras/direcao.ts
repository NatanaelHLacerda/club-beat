// REQ-009 — prazo em dias úteis e destino da decisão. O banco faz o mesmo em somar_dias_uteis e decidir_direcao.
import type { Etapa } from './etapas'

export type Decisao = 'aprovar' | 'ajustar' | 'recusar'
export const rotuloDecisao: Record<Decisao, string> = { aprovar: 'Aprovar', ajustar: 'Ajustar', recusar: 'Recusar' }

export type RegistroDirecao = {
  levada_em?: string; levada_por?: string; motivos?: string[]; recomendacao?: string; prazo?: string
  decisao?: Decisao; motivo?: string; decidida_em?: string; decidida_por?: string; como_master?: boolean; fila_master?: boolean
}

export const textosDirecao = {
  semMotivo: 'Informe o motivo da decisão.',
  vagaOcupada: 'A vaga de Master está ocupada. Aprove como Ouro e coloque na fila do Master.',
} as const

const iso = (d: Date) => d.toISOString().slice(0, 10)

export function somarDiasUteis(inicio: string, n: number, feriados: string[] = []): string {
  const d = new Date(`${inicio}T12:00:00Z`)
  let contados = 0
  while (contados < n) {
    d.setUTCDate(d.getUTCDate() + 1)
    const dia = d.getUTCDay()
    if (dia !== 0 && dia !== 6 && !feriados.includes(iso(d))) contados++
  }
  return iso(d)
}

export function destinoDaDecisao(decisao: Decisao, temAceite: boolean, destinoRecusa: 'espera' | 'recusada' = 'recusada'): Etapa {
  if (decisao === 'aprovar') return temAceite ? 'contrato' : 'proposta'
  if (decisao === 'ajustar') return 'proposta'
  return destinoRecusa
}

export const prazoVencido = (prazo: string | undefined, hoje: string) => Boolean(prazo && hoje > prazo)
