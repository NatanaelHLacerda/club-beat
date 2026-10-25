import { describe, expect, it } from 'vitest'
import { bloqueioDeEnvio, camposAbertos, mensagensModelo, preencherModelo } from './mensagens'

const a2 = 'Olá, [nome]! Analisamos o material da [empresa] e gostamos do perfil. Quem vai falar com vocês é [Gerente], Gerente de Negócios do Club.'

describe('mensagens-modelo (REQ-015)', () => {
  it('A2 preenchido com empresa e Gerente', () => {
    const t = preencherModelo(a2, { nome: 'Paula Souza', empresa: 'Rede Verde', gerente: 'Fernanda (exemplo)' })
    expect(t).toContain('Olá, Paula!')
    expect(t).toContain('Rede Verde')
    expect(t).toContain('é Fernanda, Gerente')
    expect(camposAbertos(t)).toEqual([])
  })
  it('campo sem dado fica entre colchetes e bloqueia o envio', () => {
    const t = preencherModelo('Em [data]?', {})
    expect(t).toBe('Em [data]?')
    expect(bloqueioDeEnvio('proposta', t)).toBe(mensagensModelo.camposAbertos)
  })
  it('antes da proposta não cita valores', () => {
    expect(bloqueioDeEnvio('reuniao', 'O padrão custa R$ 1.000')).toBe(mensagensModelo.semValor)
    expect(bloqueioDeEnvio('proposta', 'O padrão custa R$ 1.000')).toBeNull()
  })
})
