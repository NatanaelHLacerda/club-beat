import { describe, expect, it } from 'vitest'
import { comparaMeta, percentual, textoNumero, textoPercentual } from './indicadores'

describe('indicadores (REQ-016)', () => {
  it('10 recebidas e 8 respondidas em até 2 dias úteis → 80%', () => {
    expect(textoPercentual(percentual(8, 10))).toBe('80%')
  })
  it('sem base no mês mostra "—", nunca 0%', () => {
    expect(textoPercentual(percentual(0, 0))).toBe('—')
    expect(textoNumero(null)).toBe('—')
  })
  it('sem meta cadastrada', () => {
    expect(comparaMeta(80, null)).toBe('sem_meta')
    expect(comparaMeta(80, 75)).toBe('atingida')
    expect(comparaMeta(30, 25, true)).toBe('abaixo')
  })
})
