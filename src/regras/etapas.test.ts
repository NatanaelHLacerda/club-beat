import { describe, expect, it } from 'vitest'
import { bloqueioDeMudanca, destinosPossiveis, mensagensEtapa, validarSaida } from './etapas'

describe('etapas do funil (REQ-004)', () => {
  it('Recusada exige motivo', () => {
    expect(validarSaida('recusada', '  ', '')).toBe(mensagensEtapa.semMotivo)
    expect(validarSaida('recusada', 'Categoria não aceita', '')).toBeNull()
  })
  it('Em espera exige motivo e data para retomar', () => {
    expect(validarSaida('espera', 'Sem retorno', '')).toBe(mensagensEtapa.semRetomar)
    expect(validarSaida('espera', 'Sem retorno', '2027-04-01')).toBeNull()
  })
  it('Ativa só pela assinatura', () => {
    expect(bloqueioDeMudanca('contrato', 'ativa')).toBe(mensagensEtapa.ativa)
  })
  it('Com a Direção só pela porta da Direção', () => {
    expect(bloqueioDeMudanca('proposta', 'direcao')).toBe(mensagensEtapa.direcao)
  })
  it('parceria ativa não sai pelo funil', () => {
    expect(bloqueioDeMudanca('ativa', 'recusada')).toBe(mensagensEtapa.saidaDepoisDeAtiva)
  })
  it('card pode voltar de etapa (DP-0401)', () => {
    expect(destinosPossiveis('reuniao')).toContain('triagem2')
    expect(destinosPossiveis('reuniao')).not.toContain('ativa')
  })
})
