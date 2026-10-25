import { describe, expect, it } from 'vitest'
import { calcularVariacao, textoVariacao } from './variacao'

describe('variação vs mês anterior (REQ-018)', () => {
  it('12 contra 10 → +20%, sobe', () => {
    const v = calcularVariacao(12, 10)
    expect(v).toEqual({ percentual: 20, direcao: 'sobe' })
    expect(textoVariacao(v)).toBe('+20%')
  })
  it('queda aparece negativa', () => {
    expect(textoVariacao(calcularVariacao(5, 10))).toBe('-50%')
  })
  it('sem anterior ou anterior 0 → "—"', () => {
    expect(textoVariacao(calcularVariacao(12, 0))).toBe('—')
    expect(textoVariacao(calcularVariacao(12, null))).toBe('—')
    expect(calcularVariacao(null, 3).direcao).toBeNull()
  })
})
