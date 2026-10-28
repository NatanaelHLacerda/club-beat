import { describe, expect, it } from 'vitest'
import type { Empresa } from '../dados/tipos'
import { abaDaNegociacao, quandoLegivel, respostaAtrasada, separarNegociacao } from './negociacao'

const emp = (etapa: Empresa['etapa'], proposta: Empresa['proposta'] = {}, reuniao: Empresa['reuniao'] = {}) => ({ etapa, proposta, reuniao })

describe('abas de negociação (REQ-044)', () => {
  it('reunião marcada vai para Reuniões Agendadas', () => {
    expect(abaDaNegociacao(emp('reuniao'))).toBe('reunioes')
  })
  it('proposta em montagem ou com a Direção está em análise', () => {
    expect(abaDaNegociacao(emp('proposta'))).toBe('analise')
    expect(abaDaNegociacao(emp('direcao', { enviada_em: '2026-10-01' }))).toBe('analise')
  })
  it('proposta enviada sem aceite está em negociação', () => {
    expect(abaDaNegociacao(emp('proposta', { enviada_em: '2026-10-01T10:00:00Z' }))).toBe('negociacao')
    expect(abaDaNegociacao(emp('proposta', { enviada_em: '2026-10-01', aceite_em: '2026-10-03' }))).toBe('analise')
  })
  it('outras etapas não aparecem', () => {
    for (const e of ['recebida', 'triagem1', 'triagem2', 'contrato', 'ativa', 'renovacao', 'encerrada', 'espera', 'recusada'] as const) {
      expect(abaDaNegociacao(emp(e))).toBeNull()
    }
  })
  it('separa as listas e ordena reuniões pela data', () => {
    const r = separarNegociacao([
      { id: 1, ...emp('reuniao', {}, { quando: '2026-11-05T10:00' }) },
      { id: 2, ...emp('reuniao', {}, { quando: '2026-10-30T09:00' }) },
      { id: 3, ...emp('reuniao') },
      { id: 4, ...emp('proposta') },
    ])
    expect(r.reunioes.map((x) => x.id)).toEqual([2, 1, 3])
    expect(r.analise.map((x) => x.id)).toEqual([4])
    expect(r.negociacao).toEqual([])
  })
  it('formata a data da reunião', () => {
    expect(quandoLegivel('2026-10-30T09:00')).toBe('30/10/2026 09:00')
    expect(quandoLegivel('2026-10-30')).toBe('30/10/2026')
    expect(quandoLegivel(undefined)).toBeNull()
  })
  it('marca resposta atrasada só para proposta enviada', () => {
    const enviada = emp('proposta', { enviada_em: '2026-10-01', prazo_resposta: '2026-10-10' })
    expect(respostaAtrasada(enviada, '2026-10-11')).toBe(true)
    expect(respostaAtrasada(enviada, '2026-10-10')).toBe(false)
    expect(respostaAtrasada(emp('proposta', { prazo_resposta: '2026-10-10' }), '2026-10-20')).toBe(false)
  })
})
