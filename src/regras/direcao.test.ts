import { describe, expect, it } from 'vitest'
import { destinoDaDecisao, prazoVencido, somarDiasUteis } from './direcao'

describe('porta da Direção (REQ-009)', () => {
  it('3 dias úteis pulam fim de semana e feriado', () => {
    expect(somarDiasUteis('2026-10-30', 3, ['2026-11-02'])).toBe('2026-11-05')
    expect(somarDiasUteis('2026-11-09', 3)).toBe('2026-11-12')
  })
  it('aprovar volta à proposta, ou vai ao contrato se o aceite já existe', () => {
    expect(destinoDaDecisao('aprovar', false)).toBe('proposta')
    expect(destinoDaDecisao('aprovar', true)).toBe('contrato')
  })
  it('ajustar volta à proposta; recusar vai à saída escolhida', () => {
    expect(destinoDaDecisao('ajustar', true)).toBe('proposta')
    expect(destinoDaDecisao('recusar', false, 'espera')).toBe('espera')
  })
  it('prazo vencido depois do dia limite', () => {
    expect(prazoVencido('2026-11-05', '2026-11-05')).toBe(false)
    expect(prazoVencido('2026-11-05', '2026-11-06')).toBe(true)
  })
})
