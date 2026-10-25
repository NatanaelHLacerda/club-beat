import { describe, expect, it } from 'vitest'
import { diasParaOFim, marcoDeRenovacao, pendenciasEncerramento, quemDecideRenovacao } from './renovacao'

describe('renovação (REQ-013)', () => {
  it('contrato que termina em 30/11/2027 entra em renovação em 01/09/2027 (90 dias)', () => {
    expect(diasParaOFim('2027-11-30', '2027-09-01')).toBe(90)
    expect(marcoDeRenovacao('2027-11-30', '2027-09-01')).toBe(90)
    expect(marcoDeRenovacao('2027-11-30', '2027-08-31')).toBeNull()
  })
  it('lembretes aos 60 e 30 dias', () => {
    expect(marcoDeRenovacao('2027-11-30', '2027-10-01')).toBe(60)
    expect(marcoDeRenovacao('2027-11-30', '2027-10-31')).toBe(30)
  })
  it('Ouro e Master: Direção decide; Bronze e Prata: Gerente', () => {
    expect(quemDecideRenovacao('ouro')).toBe('direcao')
    expect(quemDecideRenovacao('prata')).toBe('gerente')
    expect(quemDecideRenovacao('prata', 'ouro')).toBe('direcao')
  })
  it('encerramento exige a lista completa', () => {
    expect(pendenciasEncerramento({ relatorio_final: true })).toHaveLength(3)
  })
})
