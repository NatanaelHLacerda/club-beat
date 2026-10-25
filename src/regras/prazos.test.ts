import { describe, expect, it } from 'vitest'
import { somarDiasUteis } from './direcao'
import { situacaoDoPrazo } from './prazos'

describe('prazos (REQ-014)', () => {
  it('entrou em Triagem 1 numa sexta: o prazo vence na segunda', () => {
    expect(somarDiasUteis('2026-11-06', 1)).toBe('2026-11-09')
  })
  it('feriado na segunda empurra para terça', () => {
    expect(somarDiasUteis('2026-10-30', 1, ['2026-11-02'])).toBe('2026-11-03')
  })
  it('situação: no prazo, vence hoje, atrasado', () => {
    expect(situacaoDoPrazo('2026-11-09', '2026-11-06')).toBe('no_prazo')
    expect(situacaoDoPrazo('2026-11-09', '2026-11-09')).toBe('vence_hoje')
    expect(situacaoDoPrazo('2026-11-09', '2026-11-10')).toBe('atrasado')
  })
})
