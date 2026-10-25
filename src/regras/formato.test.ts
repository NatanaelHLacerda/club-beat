import { describe, expect, it } from 'vitest'
import { cnpjValido, formatarCnpj, formatarDinheiro } from './formato'

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
