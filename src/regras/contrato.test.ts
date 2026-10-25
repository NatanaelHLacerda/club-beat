import { describe, expect, it } from 'vitest'
import { cpfValido, itensConferencia, mascararCpf, pendenciasConferencia, pendenciasPacote, textosContrato, validarAssinatura } from './contrato'

describe('contrato (REQ-010)', () => {
  it('CPF pelos dígitos verificadores', () => {
    expect(cpfValido('529.982.247-25')).toBe(true)
    expect(cpfValido('111.111.111-11')).toBe(false)
    expect(cpfValido('529.982.247-24')).toBe(false)
  })
  it('pacote sem CPF é recusado', () => {
    expect(pendenciasPacote({ endereco: 'Rua', signatario_nome: 'Ana', email_assinatura: 'a@b.c' }).signatario_cpf).toBe(textosContrato.semCpf)
  })
  it('CPF aparece mascarado', () => {
    expect(mascararCpf('52998224725')).toBe('***.982.247-**')
  })
  it('exclusividade em branco impede pronto para assinar', () => {
    const todos = Object.fromEntries(itensConferencia.map((i) => [i.id, true]))
    expect(pendenciasConferencia(todos)).toEqual([])
    expect(pendenciasConferencia({ ...todos, exclusividade: false })).toEqual(['Exclusividade descrita, ou "não há"'])
  })
  it('assinatura exige datas e testemunhas', () => {
    expect(validarAssinatura('2026-12-01', '2027-11-30', false)).toBe(textosContrato.testemunhas)
    expect(validarAssinatura('2026-12-01', '2026-11-30', true)).toBe(textosContrato.datas)
    expect(validarAssinatura('2026-12-01', '2027-11-30', true)).toBeNull()
  })
})
