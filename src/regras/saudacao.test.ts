import { describe, expect, it } from 'vitest'
import { saudacao } from './saudacao'

// Horários em UTC; São Paulo está em UTC-3 (sem horário de verão).
const sp = (hora: string) => new Date(`2026-10-26T${hora}-03:00`)

describe('saudação', () => {
  it('bom dia das 5h às 11h59 de São Paulo', () => {
    expect(saudacao(sp('05:00:00'))).toBe('Bom dia')
    expect(saudacao(sp('11:59:00'))).toBe('Bom dia')
  })
  it('boa tarde das 12h às 17h59', () => {
    expect(saudacao(sp('12:00:00'))).toBe('Boa tarde')
    expect(saudacao(sp('17:59:00'))).toBe('Boa tarde')
  })
  it('boa noite das 18h às 4h59', () => {
    expect(saudacao(sp('18:00:00'))).toBe('Boa noite')
    expect(saudacao(sp('23:30:00'))).toBe('Boa noite')
    expect(saudacao(sp('04:59:00'))).toBe('Boa noite')
  })
  it('usa a hora de São Paulo, não a do relógio da máquina', () => {
    expect(saudacao(new Date('2026-10-26T13:00:00Z'))).toBe('Bom dia')
  })
})
