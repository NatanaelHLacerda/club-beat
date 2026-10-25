import { describe, expect, it } from 'vitest'
import { passosDoCaminho, proximoPasso } from './caminho'

describe('caminho da ficha (REQ-022)', () => {
  it('em Triagem 2: Recebida e Triagem 1 feitas, Triagem 2 atual, sem Direção', () => {
    const p = passosDoCaminho('triagem2', false)
    expect(p.map((x) => `${x.rotulo}:${x.estado}`).slice(0, 4)).toEqual(['Recebida:feito', 'Triagem 1:feito', 'Triagem 2:atual', 'Reunião:futuro'])
    expect(p.some((x) => x.chave === 'direcao')).toBe(false)
  })
  it('Direção aparece quando o caso passou por ela', () => {
    expect(passosDoCaminho('contrato', true).find((x) => x.chave === 'direcao')?.estado).toBe('feito')
  })
  it('Rede Verde em proposta sem envio: Enviar a proposta, aba da proposta, com prazo', () => {
    const r = proximoPasso({ etapa: 'proposta', retomar_em: null }, { descricao: 'Enviar a proposta', prazo: '2026-10-21', situacao: 'atrasado' })
    expect(r).toEqual({ texto: 'Enviar a proposta', aba: 'proposta', prazo: '2026-10-21', situacao: 'atrasado' })
  })
  it('sem prazo: parceria ativa acompanha; recusada não tem passo', () => {
    expect(proximoPasso({ etapa: 'ativa', retomar_em: null })?.aba).toBe('parceria')
    expect(proximoPasso({ etapa: 'recusada', retomar_em: null })).toBeNull()
  })
})
