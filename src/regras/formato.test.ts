import { describe, expect, it } from 'vitest'
import { centavosParaReais, cnpjValido, formatarCnpj, formatarDinheiro, reaisParaCentavos } from './formato'

describe('formato', () => {
  it('valida CNPJ pelos dígitos verificadores', () => {
    expect(cnpjValido('11.222.333/0001-81')).toBe(true)
    expect(cnpjValido('11.111.111/1111-11')).toBe(false)
    expect(cnpjValido('11.222.333/0001-82')).toBe(false)
    expect(cnpjValido('123')).toBe(false)
  })
  it('formata CNPJ', () => {
    expect(formatarCnpj('11222333000181')).toBe('11.222.333/0001-81')
  })
  it('dinheiro ausente aparece como R$ …', () => {
    expect(formatarDinheiro(null)).toBe('R$ …')
    expect(formatarDinheiro(123456)).toMatch(/1\.234,56/)
  })
})

describe('reais ↔ centavos (REQ-041)', () => {
  it('converte e valida', () => {
    expect(reaisParaCentavos('1.234,56')).toBe(123456)
    expect(reaisParaCentavos('R$ 5.000')).toBe(500000)
    expect(reaisParaCentavos('10,5')).toBe(1050)
    expect(reaisParaCentavos('')).toBeNull()
    expect(reaisParaCentavos('abc')).toBeUndefined()
    expect(centavosParaReais(123456)).toBe('1.234,56')
    expect(centavosParaReais(null)).toBe('')
  })
})
